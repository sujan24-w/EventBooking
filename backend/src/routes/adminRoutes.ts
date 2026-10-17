import { Router } from "express";
import {
  authMiddleware,
} from "../middlewares/authMiddleware";

import {
  adminMiddleware,
} from "../middlewares/adminMiddleware";

import { createEventSchema, 
  updateEventSchema } from "../validation/eventValidation";

import { validate } from "../middlewares/zodMiddleware";
import { cancelEvent, 
    createEvent,
     updateEvent,
     softDeleteEvent,
  restoreEvent,
    } from "../controllers/eventController";

import { getEventBookings } from "../controllers/bookingController";
import { getAdminDashboard } from "../controllers/adminDashboard";
const router = Router();

router.use(authMiddleware, adminMiddleware);
router.post("/", validate(createEventSchema), createEvent);
router.patch("/:id", validate(updateEventSchema), updateEvent);
router.patch("/:id/cancel", cancelEvent);
router.delete("/:id", softDeleteEvent);
router.patch("/:id/restore", restoreEvent);
router.get("/events/:eventId/bookings", getEventBookings);

 router.get("/dashboard", getAdminDashboard);


export default router;