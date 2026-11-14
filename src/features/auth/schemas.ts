import { z } from "zod";

import { BUSINESS_TYPES } from "@/features/company/business-types";
import {
  emailField,
  gstinField,
  mobileField,
  panField,
  pinCodeField,
  requiredText,
} from "@/lib/validation";

// The rules and messages follow spareXB2B/src/features/auth/schemas.ts.

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Your password has at least 8 characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const twoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from the SMS."),
});

export type TwoFactorValues = z.infer<typeof twoFactorSchema>;

export const forgotPasswordSchema = z.object({ email: emailField });

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** The rules a new password must meet, shown as ticks while typing. */
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "A letter", test: (value: string) => /[A-Za-z]/.test(value) },
  { label: "A number", test: (value: string) => /\d/.test(value) },
];

export const newPasswordSchema = z
  .object({
    /** The token from the invite or reset link (the link itself can be pasted). */
    token: z.string().trim().min(10, "Paste the link from your email, or open it on this phone."),
    password: z
      .string()
      .refine(
        (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
        "Use at least 8 characters, with a letter and a number.",
      ),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "The two passwords don't match.",
  });

export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export const applicationLookupSchema = z.object({
  ref: z.string().trim().toUpperCase().regex(/^APP-\d{4}-\d{4,}$/, "Enter the reference, like APP-2026-0031."),
  key: z.string().trim().min(6, "Enter the access key from your application email."),
});

export type ApplicationLookupValues = z.infer<typeof applicationLookupSchema>;

export const MAX_SHOP_PHOTOS = 6;
export const MAX_DOCUMENT_PHOTOS = 4;

export const registerSchema = z.object({
  // Step 1: business
  businessName: requiredText("Enter your business name."),
  businessType: z.enum(BUSINESS_TYPES, { error: "Choose what kind of business you run." }),
  gstin: gstinField.or(z.literal("")),
  pan: panField.or(z.literal("")),
  licenceNumber: z.string().trim().max(40, "Keep it to 40 characters or fewer."),
  otherRegistration: z.string().trim().max(40, "Keep it to 40 characters or fewer."),
  documents: z.array(z.string()).max(MAX_DOCUMENT_PHOTOS, `Add up to ${MAX_DOCUMENT_PHOTOS} photos.`),
  // Step 2: contact and location
  contactName: z.string().trim(),
  email: emailField,
  mobile: mobileField,
  addressLine1: requiredText("Enter the building and street."),
  addressLine2: z.string().trim(),
  pin: pinCodeField,
  city: requiredText("Enter your city."),
  state: requiredText("Enter your state."),
  // Step 3: photos
  photos: z
    .array(z.string())
    .min(1, "Add at least one photo of your shop or workshop.")
    .max(MAX_SHOP_PHOTOS, `Add up to ${MAX_SHOP_PHOTOS} photos.`),
  // Step 4: review
  acceptTerms: z.boolean().refine(Boolean, "Accept the terms to send your application."),
});

export type RegisterValues = z.infer<typeof registerSchema>;

/** The wizard's steps and the fields each one checks before moving on. */
export const REGISTER_STEPS = [
  {
    title: "Your business",
    fields: ["businessName", "businessType", "gstin", "pan", "licenceNumber", "otherRegistration", "documents"],
  },
  {
    title: "Contact and location",
    fields: ["contactName", "email", "mobile", "addressLine1", "addressLine2", "pin", "city", "state"],
  },
  { title: "Shop photos", fields: ["photos"] },
  { title: "Check and send", fields: ["acceptTerms"] },
] as const satisfies readonly { title: string; fields: readonly (keyof RegisterValues)[] }[];

export const EMPTY_REGISTRATION: RegisterValues = {
  businessName: "",
  businessType: "garage",
  gstin: "",
  pan: "",
  licenceNumber: "",
  otherRegistration: "",
  documents: [],
  contactName: "",
  email: "",
  mobile: "",
  addressLine1: "",
  addressLine2: "",
  pin: "",
  city: "",
  state: "",
  photos: [],
  acceptTerms: false,
};
