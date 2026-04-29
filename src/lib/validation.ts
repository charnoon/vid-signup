import { z } from "zod";

export const signupSchema = z.object({
  first_name: z.string().trim().min(2, "First name must be at least 2 characters"),
  last_name: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  role: z.string().trim().optional(),
  interest: z.string().trim().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export type SignupResponse =
  | { success: true; message: string }
  | { success: false; error: string };
