import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}


export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const {token} = req.cookies;
console.log(token);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: string; role: string };

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
console.log("passing throw middleware auth");

    next();
  } catch {
    res.status(500).json({
     success: false,
      ok: "not ok",
      message: "Invalid or expired token",
    });
  }
};