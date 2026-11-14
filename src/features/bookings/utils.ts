import type { Booking } from "@/features/bookings/types";

/** A garage has two minutes to answer a new booking before it goes to another garage (CLAUDE.md §8). */
export const BOOKING_ANSWER_MS = 2 * 60_000;

/** "General service, Wheel alignment", or what the customer wrote when they booked no package. */
export function bookedServicesText(booking: Pick<Booking, "services" | "notes">): string {
  const names = booking.services.map((service) => service.name).join(", ");
  return names || booking.notes || "Repair (see the customer's note)";
}

/** Stands for "the reason is typed in"; customers never see it. */
export const OTHER_REASON = "Other";

/** One-tap reasons in words a customer can read, since they see the one chosen (website `utils.ts`). */
export function getDeclineReasons(booking: Pick<Booking, "pickupDrop">): string[] {
  return [
    "Fully booked that day",
    "This time isn't available",
    "We don't offer this service",
    ...(booking.pickupDrop ? ["Too far for pick-up"] : []),
    OTHER_REASON,
  ];
}

/** Whether the garage can still answer: new, and inside its two minutes. */
export function isAnswerable(booking: Pick<Booking, "status" | "respondBy">, now: Date): boolean {
  return booking.status === "new" && Date.parse(booking.respondBy) > now.getTime();
}
