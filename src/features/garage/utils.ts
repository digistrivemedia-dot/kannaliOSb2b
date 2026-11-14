import type { GarageProfileValues } from "@/features/garage/schemas";
import type { GarageProfile, Weekday } from "@/features/garage/types";
import { parseTypedDate, toTypedDate } from "@/lib/dates";

// Copied from spareXB2B/src/features/garage/utils.ts; holiday dates are typed DD/MM/YYYY on the phone.

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** Adds the colon as digits are typed: "0930" → "09:30". */
export function maskTime(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

/** A service id the API takes (letters, digits, "-"; up to 60). */
export function newServiceId(): string {
  return `svc-${Date.now().toString(36)}-${Math.round(Math.random() * 1296).toString(36)}`;
}

/** The editor's string fields from the saved profile. */
export function toProfileValues(profile: GarageProfile): GarageProfileValues {
  return {
    ...profile,
    services: profile.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: String(service.priceInPaise / 100),
      duration: String(service.durationMinutes),
    })),
    dailyBookingLimit: String(profile.dailyBookingLimit),
    pickupDrop: {
      isOffered: profile.pickupDrop.isOffered,
      fee: String(profile.pickupDrop.feeInPaise / 100),
      radiusKm: String(profile.pickupDrop.radiusKm),
    },
    holidays: profile.holidays.map((holiday) => ({
      date: toTypedDate(holiday.date),
      name: holiday.name,
    })),
  };
}

/** The saved profile from the editor's values (photos are turned into data URLs separately). */
export function toGarageProfile(values: GarageProfileValues): GarageProfile {
  return {
    ...values,
    services: values.services.map((service) => ({
      id: service.id,
      name: service.name,
      priceInPaise: Math.round(Number(service.price) * 100),
      durationMinutes: Number(service.duration),
    })),
    dailyBookingLimit: Number(values.dailyBookingLimit),
    pickupDrop: {
      isOffered: values.pickupDrop.isOffered,
      feeInPaise: Math.round(Number(values.pickupDrop.fee) * 100),
      radiusKm: Number(values.pickupDrop.radiusKm),
    },
    holidays: values.holidays
      .map((holiday) => ({ date: parseTypedDate(holiday.date) ?? "", name: holiday.name }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
