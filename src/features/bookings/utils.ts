import type { Booking } from "@/features/bookings/types";

/** A garage has two minutes to answer a new booking before it goes to another garage (CLAUDE.md §8). */
export const BOOKING_ANSWER_MS = 2 * 60_000;

/** "General service, Wheel alignment" */
export function bookedServicesText(booking: Pick<Booking, "services">): string {
  return booking.services.map((service) => service.name).join(", ");
}
