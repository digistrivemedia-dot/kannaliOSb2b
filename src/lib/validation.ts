import { z } from "zod";

import { GSTIN_PATTERN, isValidGstin } from "@/lib/gst";

// Zod fields shared by every form that asks for the same thing (spareXB2B/src/lib/validation.ts).

export const emailField = z
  .string()
  .trim()
  .pipe(z.email("Enter a valid email address, like name@yourbusiness.com."));

/** 10 digits without +91; forms show +91 beside the input. */
export const mobileField = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");

export const pinCodeField = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code.");

export const gstinField = z
  .string()
  .trim()
  .regex(GSTIN_PATTERN, "Enter your 15-character GSTIN, like 29AAKFS4821M1Z3.")
  .refine(isValidGstin, "The first two digits of this GSTIN aren't a state code.");

export const panField = z
  .string()
  .trim()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Enter a 10-character PAN, like AAKFS4821M.");

export function requiredText(message: string) {
  return z.string().trim().min(1, message);
}

/**
 * For forms kept in plain state rather than react-hook-form: the first message the schema gives,
 * or null when the values are fine.
 */
export function firstProblem(schema: z.ZodType, values: unknown): string | null {
  const result = schema.safeParse(values);
  return result.success ? null : (result.error.issues[0]?.message ?? "Check the details.");
}
