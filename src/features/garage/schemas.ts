import { z } from "zod";

import { parseTypedDate } from "@/lib/dates";
import { requiredText } from "@/lib/validation";

// The garage profile editor's form (spareXB2B/src/features/garage/schemas.ts), with the backend's limits.

/** The backend keeps 6 photos; each is shrunk so the whole profile fits its 2 MB request limit. */
export const MAX_GARAGE_PHOTOS = 6;
export const MAX_GARAGE_PHOTO_BYTES = 200 * 1024;

const rupees = z
  .string()
  .trim()
  .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a price in rupees, like 899.");

const wholeNumber = (message: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .refine((value) => Number(value) >= min && Number(value) <= max, message);

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a time like 09:30.");

export const garageProfileSchema = z.object({
  about: z.string().trim().max(600, "Keep it to 600 characters or fewer."),
  photos: z
    .array(z.string())
    .min(1, "Add at least one photo of your garage.")
    .max(MAX_GARAGE_PHOTOS, `Add up to ${MAX_GARAGE_PHOTOS} photos.`),
  services: z
    .array(
      z.object({
        id: z.string(),
        name: requiredText("Name the service."),
        price: rupees.refine((value) => Number(value) > 0, "Enter a price above zero."),
        duration: wholeNumber("Enter minutes, from 5 to 600.", 5, 600),
      }),
    )
    .min(1, "Add at least one service customers can book."),
  vehicleTypes: z
    .array(z.enum(["bike", "scooter", "car", "commercial"]))
    .min(1, "Choose at least one vehicle type."),
  openingHours: z.array(
    z
      .object({
        day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
        isOpen: z.boolean(),
        opensAt: time,
        closesAt: time,
      })
      .refine((hours) => !hours.isOpen || hours.opensAt < hours.closesAt, {
        path: ["closesAt"],
        message: "Closing time must be after opening time.",
      }),
  ),
  dailyBookingLimit: wholeNumber("Enter a number from 1 to 200.", 1, 200),
  pickupDrop: z.object({
    isOffered: z.boolean(),
    fee: rupees,
    radiusKm: wholeNumber("Enter a distance from 1 to 50 km.", 1, 50),
  }),
  holidays: z.array(
    z.object({
      /** As typed, DD/MM/YYYY. */
      date: z
        .string()
        .refine((value) => parseTypedDate(value) !== null, "Enter a date like 26/01/2027."),
      name: requiredText("Name the holiday."),
    }),
  ),
});

export type GarageProfileValues = z.infer<typeof garageProfileSchema>;
