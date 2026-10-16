import { Router } from "express";
import { getEvents,getEventById,createEvent, updateEvent,cancelEvent } from "../controllers/eventController";
import { validateQuery,validate } from "../middlewares/zodMiddleware";
import { getEventsSchema,createEventSchema, updateEventSchema } from "../validation/eventValidation";

const router = Router();

router.get("/", validateQuery(getEventsSchema), getEvents);
router.get("/:id",  getEventById);

router.post("/", validate(createEventSchema), createEvent);
router.patch("/:id", validate(updateEventSchema), updateEvent);
router.patch("/:id/cancel", cancelEvent);


export default router;