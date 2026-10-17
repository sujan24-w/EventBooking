
import type { Response, Request } from "express";
import { pool } from "../config/database";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";

const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const client = await pool.connect();

  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;
  console.log("hello book",eventId, userId);
  
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (req.user?.role !== "USER") {
      res.status(403).json({
        success: false,
        message: "Only users can book events",
      });
      return;
    }

    await client.query("BEGIN");

    // Lock this event while checking and creating the booking.
    const eventResult = await client.query(
      `SELECT id, title, venue, starts_at, total_seats, is_cancelled
       FROM events
       WHERE id = $1
         AND is_deleted = FALSE
       FOR UPDATE`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const event = eventResult.rows[0];

    if (event.is_cancelled) {
      await client.query("ROLLBACK");
      res.status(409).json({
        success: false,
        message: "This event has been cancelled",
      });
      return;
    }

    if (new Date(event.starts_at).getTime() <= Date.now()) {
      await client.query("ROLLBACK");
      res.status(409).json({
        success: false,
        message: "Cannot book an event that has already started",
      });
      return;
    }

    // A user can have only one ACTIVE booking per event.
    const existingBooking = await client.query(
      `SELECT id
       FROM bookings
       WHERE event_id = $1
         AND user_id = $2
         AND status = 'ACTIVE'`,
      [eventId, userId]
    );

    if (existingBooking.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(409).json({
        success: false,
        message: "You have already booked this event",
      });
      return;
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::int AS active_bookings
       FROM bookings
       WHERE event_id = $1
         AND status = 'ACTIVE'`,
      [eventId]
    );

    const activeBookings: number = countResult.rows[0].active_bookings;
    const seatsLeft: number = event.total_seats - activeBookings;

    if (seatsLeft <= 0) {
      await client.query("ROLLBACK");
      res.status(409).json({
        success: false,
        message: "This event is fully booked",
      });
      return;
    }

    const bookingResult = await client.query(
      `INSERT INTO bookings (event_id, user_id, status)
       VALUES ($1, $2, 'ACTIVE')
       RETURNING id, event_id, user_id, status, created_at, updated_at`,
      [eventId, userId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Booking successful",
      booking: bookingResult.rows[0],
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        starts_at: event.starts_at,
        seats_left: seatsLeft - 1,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        success: false,
        message: "You have already booked this event",
      });
      return;
    }

    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  } finally {
    client.release();
  }
};

 const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const result = await pool.query(
      `SELECT
         b.id AS booking_id,
         b.status AS booking_status,
         b.created_at AS booked_at,
         b.updated_at,
         e.id AS event_id,
         e.title,
         e.description,
         e.starts_at,
         e.ends_at,
         e.venue,
         e.image_url,
         e.is_cancelled AS event_cancelled,
         e.is_deleted AS event_deleted
       FROM bookings b
       INNER JOIN events e ON e.id = b.event_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    

    res.status(200).json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve your bookings",
    });
  }
};

 const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }
        // 1. Find the user's booking and its event start time
    const bookingResult = await pool.query(
      `
        SELECT
          b.id,
          b.status,
          e.starts_at
        FROM bookings b
        INNER JOIN events e ON e.id = b.event_id
        WHERE b.id = $1
          AND b.user_id = $2
      `,
      [bookingId, userId]
    );
   if (bookingResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }
     const booking = bookingResult.rows[0];

      // 2. Reject cancellation if the event has started
    if (new Date(booking.starts_at) <= new Date()) {
      res.status(409).json({
        success: false,
        message: "Bookings cannot be cancelled after the event has started",
      });
      return;
    }
     // 3. Reject already-cancelled bookings
    if (booking.status !== "ACTIVE") {
      res.status(409).json({
        success: false,
        message: "This booking has already been cancelled",
      });
      return;
    }

   //  Cancel only this user active booking
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'CANCELLED',
           updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status = 'ACTIVE'
       RETURNING id, event_id, status, updated_at`,
      [bookingId, userId]
    );

     if (result.rows.length === 0) {
      res.status(409).json({
        success: false,
        message: "Booking could not be cancelled",
      });
      return;
    }
     
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};


const getEventBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;

    const eventResult = await pool.query(
      `SELECT id, title, starts_at, venue, total_seats,
      is_cancelled, is_deleted
       FROM events
       WHERE id = $1`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const result = await pool.query(
      `SELECT
         b.id AS booking_id,
         b.status AS booking_status,
         b.created_at AS booked_at,
         u.id AS user_id,
         u.name AS user_name,
         u.email AS user_email
       FROM bookings b
       INNER JOIN users u ON u.id = b.user_id
       WHERE b.event_id = $1
       ORDER BY b.created_at DESC`,
      [eventId]
    );

    const activeBookings = result.rows.filter(
      (booking) => booking.booking_status === "ACTIVE"
    ).length;

    res.status(200).json({
      success: true,
      event: eventResult.rows[0],
      summary: {
        total_bookings: result.rows.length,
        active_bookings: activeBookings,
        cancelled_bookings: result.rows.length - activeBookings,
        seats_left: Math.max(
          0,
          eventResult.rows[0].total_seats - activeBookings
        ),
      },
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Get event bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve event bookings",
    });
  }
};


export {createBooking,
   getMyBookings,
    cancelBooking,
  getEventBookings,}