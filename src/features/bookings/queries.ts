import { useQuery } from "@tanstack/react-query";

import { getBookings } from "@/features/bookings/api";
import type { BookingFilters } from "@/features/bookings/types";
import { LIVE_REFETCH_MS } from "@/lib/constants";

export const bookingKeys = {
  list: (filters: BookingFilters) => ["bookings", "list", filters] as const,
};

/** A page of bookings. Looks again every 15 s while the app is open, for new bookings. */
export function useBookings(filters: BookingFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => getBookings(filters),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}
