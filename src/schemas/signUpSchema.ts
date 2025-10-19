import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(10, "Username must not be more than 10 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain any special characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});
