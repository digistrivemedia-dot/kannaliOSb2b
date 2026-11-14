import type { Booking, BookingFilters } from "@/features/bookings/types";
import type { JobCard } from "@/features/jobs/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getBookings(filters: BookingFilters & { q?: string }): Promise<Paginated<Booking>> {
  return apiClient.get<Paginated<Booking>>("/garage/bookings", filters);
}

/** One booking, or null if there is none (or it was never offered to this garage). */
export function getBooking(id: string): Promise<Booking | null> {
  return orNull(apiClient.get<Booking>(`/garage/bookings/${encodeURIComponent(id)}`));
}

/** Confirms the slot; answers the job card opened for it. */
export function acceptBooking(id: string): Promise<JobCard> {
  return apiClient.post<JobCard>(`/garage/bookings/${encodeURIComponent(id)}/accept`);
}

/** Turns the booking down; the customer sees the reason. */
export function declineBooking(id: string, reason: string): Promise<Booking> {
  return apiClient.post<Booking>(`/garage/bookings/${encodeURIComponent(id)}/decline`, { reason });
}
