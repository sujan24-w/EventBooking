import { Request , Response } from "express";
import {pool } from "../config/database";

 const getEvents= async (req:Request, res:Response)
:
Promise<void>=>{

    try{
      const  { search,
      page,
      limit,
      sort,
      availability,
      includeCancelled } =
        res.locals.validatedQuery;

const offset = (page - 1) * limit;


const  sortOptions: Record<string,string>= {

     soonest: "e.starts_at ASC",
     latest: "e.starts_at DESC",
      shortest: "(e.ends_at - e.starts_at) ASC",
      longest: "(e.ends_at - e.starts_at) DESC",
      seats_high: "available_seats DESC",
      seats_low: "available_seats ASC",
    };

const conditions: string[] = ["e.starts_at > NOW()", "e.title ILIKE $1"];
if (availability === "cancelled") {
  conditions.push("e.is_cancelled = TRUE");
} 
else if (availability === "available") {
  conditions.push("e.is_cancelled = FALSE");
  conditions.push(
    "GREATEST(e.total_seats - COALESCE(b.active_bookings, 0), 0) > 0"
  );
} 
else if (availability === "soldout") {
  conditions.push("e.is_cancelled = FALSE");
  conditions.push(
    "GREATEST(e.total_seats - COALESCE(b.active_bookings, 0), 0) = 0"
  );
} 
else if (!includeCancelled) {
  conditions.push("e.is_cancelled = FALSE");
}
  

    const fromClause = `
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS active_bookings
        FROM bookings
        WHERE status = 'ACTIVE'
        GROUP BY event_id
      ) b ON b.event_id = e.id
    `;

    const whereClause = conditions.join(" AND ");

    // Fetch the current page of events.
    const eventsResult = await pool.query(
      `
        SELECT
          e.id,
          e.title,
          e.description,
          e.starts_at,
          e.ends_at,
          e.venue,
          e.total_seats,
          e.image_url,
          e.is_cancelled,
          (
        e.created_at >= NOW() - INTERVAL '15 hours'
         ) AS is_new,
          CASE
          WHEN e.is_cancelled = TRUE THEN 'CANCELLED'
          WHEN NOW() < e.starts_at THEN 'UPCOMING'
          WHEN NOW() < e.ends_at THEN 'ONGOING'
          ELSE 'COMPLETED'
          END AS event_status,
          COALESCE(b.active_bookings, 0)::INT AS booked_seats,
          GREATEST(
            e.total_seats - COALESCE(b.active_bookings, 0),
            0
          )::INT AS available_seats,
          (
            GREATEST(
              e.total_seats - COALESCE(b.active_bookings, 0),
              0
            ) = 0
          ) AS is_sold_out
        ${fromClause}
        WHERE ${whereClause}
        ORDER BY ${sortOptions[sort]}, e.id ASC
        LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    // Count all matching events for pagination.
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::INT AS total
        ${fromClause}
        WHERE ${whereClause}
      `,
      [`%${search}%`]
    );

    const total: number = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      events: eventsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

    }catch(error){
         console.error("Get events failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
    }
};


const getEventById =async (req:Request, res:Response)
:
Promise<void>=>{

    try{
  const {id} = req.params;

  if(!id){
     res.status(400).json({
        success:false,
        message:" Event   id is missing "
     })
  };

   const result = await pool.query(
      `
        SELECT
          e.id,
          e.title,
          e.description,
          e.starts_at,
          e.ends_at,
          e.venue,
          e.total_seats,
          e.image_url,
          e.is_cancelled,
          e.created_at,
          COALESCE(b.active_bookings, 0)::INT AS booked_seats,
          GREATEST(
            e.total_seats - COALESCE(b.active_bookings, 0),
            0
          )::INT AS available_seats,
          (
            e.created_at >= NOW() - INTERVAL '15 hours'
          ) AS is_new,
          CASE
            WHEN e.is_cancelled THEN 'CANCELLED'
            WHEN NOW() < e.starts_at THEN 'UPCOMING'
            WHEN NOW() < e.ends_at THEN 'ONGOING'
            ELSE 'COMPLETED'
          END AS event_status
        FROM events e
        LEFT JOIN (
          SELECT event_id, COUNT(*) AS active_bookings
          FROM bookings
          WHERE status = 'ACTIVE'
          GROUP BY event_id
        ) b ON b.event_id = e.id
        WHERE e.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return
    }
      res.status(200).json({
      success: true,
      event: result.rows[0],
    });

    }catch(error){
     console.error("Get events failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
    }


}
export {getEvents, getEventById};