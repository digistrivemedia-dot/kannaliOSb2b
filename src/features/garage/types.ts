import type { VehicleType } from "@/features/jobs/types";

// Copied from spareXB2B/src/features/garage/types.ts; the API returns exactly these shapes.

/** A service the garage offers its own customers, at its own price (excl. GST). */
export type GarageService = {
  id: string;
  name: string;
  priceInPaise: number;
  durationMinutes: number;
};

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Times are "HH:mm", 24-hour. */
export type DayHours = { day: Weekday; isOpen: boolean; opensAt: string; closesAt: string };

export type Holiday = { date: string; name: string };

/** Fetching the vehicle and bringing it back, for one flat fee per job (excl. GST). */
export type PickupDropSettings = { isOffered: boolean; feeInPaise: number; radiusKm: number };

/** How the garage appears to customers booking a service. The same for every branch. */
export type GarageProfile = {
  about: string;
  /** Links to photos already saved; new ones are sent as data URLs. */
  photos: string[];
  services: GarageService[];
  vehicleTypes: VehicleType[];
  openingHours: DayHours[];
  /** Bookings accepted per branch per day. */
  dailyBookingLimit: number;
  holidays: Holiday[];
  pickupDrop: PickupDropSettings;
};
