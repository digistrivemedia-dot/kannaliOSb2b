import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter your business email, like name@garage.com.")),
  password: z.string().min(1, "Enter your password."),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const twoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from the SMS."),
});

export type TwoFactorValues = z.infer<typeof twoFactorSchema>;
