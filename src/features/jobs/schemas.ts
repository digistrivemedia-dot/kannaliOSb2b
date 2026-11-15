import { z } from "zod";

import { parseTypedDate } from "@/lib/dates";
import { formatPrice, isValidPlate } from "@/lib/format";
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

// The forms below keep their values in plain state (they save drafts as they go); these schemas hold
// their rules, checked with `firstProblem` before sending.

/** A progress note, or extra work the technician found. */
export function progressNoteSchema(isExtraWork: boolean) {
  return z.object({
    text: z
      .string()
      .trim()
      .min(2, isExtraWork ? "Say what you found." : "Write a short note."),
  });
}

/** The customer's answer: every line waiting on them needs one. */
export function approvalSchema(pendingLineIds: string[]) {
  return z.object({
    decisions: z
      .record(z.string(), z.enum(["approved", "rejected"]))
      .refine(
        (decisions) => pendingLineIds.every((id) => decisions[id]),
        "Mark an answer for every line.",
      ),
    note: z.string().min(1),
  });
}

/** Quality check: passing needs every check ticked; sending back needs a note. */
export const qualityCheckSchema = z.discriminatedUnion("result", [
  z.object({
    result: z.literal("pass"),
    items: z
      .array(z.object({ label: z.string(), isOk: z.boolean() }))
      .refine(
        (items) => items.every((item) => item.isOk),
        "Tick every check before passing the vehicle.",
      ),
  }),
  z.object({
    result: z.literal("rework"),
    note: z.string().trim().min(3, "Say what needs redoing."),
  }),
]);

/** Collecting the bill: cash covers it, or an online payment has its reference. */
export function collectPaymentSchema(dueInPaise: number) {
  return z.discriminatedUnion("way", [
    z.object({
      way: z.literal("cash"),
      cashInPaise: z.number().min(dueInPaise, "That's less than the bill."),
    }),
    z.object({
      way: z.enum(["online", "counter_upi"]),
      reference: z
        .string()
        .trim()
        .min(6, "Enter the UPI or payment reference from the customer's phone."),
    }),
  ]);
}

/** Handover: the checklist, the odometer, a real next-service date, and cash due at the door. */
export function handoverSchema(cashDueInPaise: number | undefined) {
  return z.object({
    checklist: z
      .array(z.boolean())
      .refine((items) => items.every(Boolean), "Tick every item before handing the vehicle over."),
    odometer: z.string().regex(/^\d{1,7}$/, "Enter the odometer reading as it leaves."),
    nextDate: z
      .string()
      .refine(
        (value) => !value || parseTypedDate(value) !== null,
        "Enter the next service date as DD/MM/YYYY, or leave it empty.",
      ),
    cashInPaise: z
      .number()
      .refine(
        (cash) => cashDueInPaise === undefined || cash >= cashDueInPaise,
        `Collect ${formatPrice(cashDueInPaise ?? 0)} in cash first.`,
      ),
  });
}
