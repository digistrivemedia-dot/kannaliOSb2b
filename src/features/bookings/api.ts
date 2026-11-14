import type { Booking, BookingFilters } from "@/features/bookings/types";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getBookings(filters: BookingFilters): Promise<Paginated<Booking>> {
  return apiClient.get<Paginated<Booking>>("/garage/bookings", filters);
}
