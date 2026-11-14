import { z } from "zod";

import { isValidPlate } from "@/lib/format";
import { mobileField, requiredText } from "@/lib/validation";

// The rules and messages follow spareXB2B/src/features/job-cards/schemas.ts.

/** What the customer wants looked at, one line each; empty lines are dropped when sent. */
const complaints = z
  .array(z.object({ text: z.string().trim().max(200, "Keep each one to 200 characters.") }))
  .refine(
    (items) => items.some((item) => item.text.length > 0),
    "Add at least one thing the customer wants looked at.",
  );

export const VEHICLE_TYPES = ["bike", "scooter", "car", "commercial"] as const;

export const walkInSchema = z
  .object({
    plate: z.string().trim().refine(isValidPlate, "Enter a number plate like KA 01 AB 1234."),
    /** Set once a plate on file is found and confirmed. */
    vehicleId: z.string(),
    type: z.enum(VEHICLE_TYPES),
    make: z.string().trim(),
    model: z.string().trim(),
    customerName: z.string().trim(),
    customerPhone: z.string().trim(),
    complaints,
  })
  .superRefine((values, context) => {
    if (values.vehicleId) return;
    // A new plate needs the vehicle and its owner.
    const required = [
      ["make", "Enter the make, like Honda."],
      ["model", "Enter the model, like Activa 6G."],
      ["customerName", "Enter the customer's name."],
    ] as const;
    for (const [field, message] of required) {
      if (!values[field]) context.addIssue({ code: "custom", path: [field], message });
    }
    const phone = mobileField.safeParse(values.customerPhone);
    if (!phone.success) {
      context.addIssue({
        code: "custom",
        path: ["customerPhone"],
        message: phone.error.issues[0]?.message ?? "Enter a valid mobile number.",
      });
    }
  });

export type WalkInValues = z.infer<typeof walkInSchema>;

export const FUEL_LEVELS = ["empty", "quarter", "half", "three_quarters", "full"] as const;

export const checkInSchema = z.object({
  odometerKm: z
    .string()
    .trim()
    .regex(/^\d{1,7}$/, "Enter the odometer reading in km."),
  fuelLevel: z.enum(FUEL_LEVELS),
  complaints,
  damages: z.array(
    z.object({
      id: z.string(),
      area: requiredText("Say where, like Left side panel."),
      note: requiredText("Describe the damage."),
      photos: z.array(z.string()),
    }),
  ),
  photos: z
    .array(z.string())
    .min(1, "Take at least one photo of the vehicle.")
    .max(6, "Add up to 6 photos."),
});

export type CheckInValues = z.infer<typeof checkInSchema>;
