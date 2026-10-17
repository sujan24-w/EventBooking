
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
        )::int AS active_bookings
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