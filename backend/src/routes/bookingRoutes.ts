import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { cancelBooking, createBooking, getMyBookings } from "../controllers/bookingController";

const router = Router(); 

router.post("/:eventId", authMiddleware, createBooking);
router.get("/me", authMiddleware, getMyBookings);
router.patch("/:bookingId/cancel", authMiddleware, cancelBooking);
export default router; 