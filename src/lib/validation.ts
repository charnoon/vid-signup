import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address"),
    marketing_consent: z.boolean(),
  })
  .refine((data) => data.marketing_consent === true, {
    message:
      "Tick the box to receive platform updates before you can submit.",
    path: ["marketing_consent"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export type SignupResponse =
  | { success: true; message: string }
  | { success: false; error: string };
