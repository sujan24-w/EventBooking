import { Router } from "express";
import { getEvents,getEventById } from "../controllers/eventController";
import { validateQuery } from "../middlewares/zodMiddleware";
import { getEventsSchema } from "../validation/eventValidation";

const router = Router();

router.get("/", validateQuery(getEventsSchema), getEvents);
router.get("/:id",  getEventById);


export default router;