import express,{ Request, Response } from "express";
import { register,login,getuser, logout } from "../controllers/auth.controller";
import { validate } from "../middlewares/zodMiddleware";
import { registerSchema, loginSchema } from "../validation/authValidation";
 import {authMiddleware}  from  "../middlewares/authMiddleware"
const router = express.Router();
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok",success:true,
    message:"welcome to EventBook API   sure"
   })
})

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware,getuser);
router.post("/logout",logout);

export  default router;