
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z.string().trim()
  .email("Please enter a valid email address")
    .toLowerCase(),

  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(24, "Password must not exceed 24 characters"),
});

 const loginSchema = z.object({
  email: z.string().trim()
    .email("Please enter a valid email address")
    .toLowerCase(),

  password: z.string().min(6, "Password must be at least 6 characters")
    .max(24, "Password must not exceed 24 characters"),
});

export { registerSchema, loginSchema };