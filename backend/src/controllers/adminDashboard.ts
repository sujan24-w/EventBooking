
import { Request, Response } from "express";
import { pool } from "../config/database";

 const getAdminDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM events
          WHERE is_deleted = FALSE
        )::int AS total_events,

        (
          SELECT COUNT(*)
          FROM bookings
          WHERE status = 'ACTIVE'
        )::int AS active_bookings,
    
     (
          SELECT COUNT(*)
          FROM events
          WHERE is_deleted = FALSE
            AND is_cancelled = FALSE
            AND starts_at > NOW()
        )::int AS upcoming_events,

      (
          SELECT COUNT(*)
          FROM events
          WHERE is_deleted = FALSE
            AND is_cancelled = FALSE
            AND COALESCE(ends_at, starts_at) < NOW()
        )::int AS completed_events,

        (
          SELECT COUNT(*)
          FROM users
          WHERE role = 'USER'
        )::int AS total_users
    `);

    res.status(200).json({
      success: true,
      stats: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch admin dashboard:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};


export {getAdminDashboard}