import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { acceptBooking, declineBooking, getBooking, getBookings } from "@/features/bookings/api";
import type { BookingFilters, BookingStatus } from "@/features/bookings/types";
import { LIVE_REFETCH_MS } from "@/lib/constants";
import { nextPage } from "@/lib/paging";

type ListFilters = BookingFilters & { q?: string };

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters: ListFilters) => ["bookings", "list", filters] as const,
  pages: (filters: ListFilters) => ["bookings", "pages", filters] as const,
  detail: (id: string) => ["bookings", "detail", id] as const,
};

/** A page of bookings. Looks again every 15 s while the app is open, for new bookings. */
export function useBookings(filters: ListFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => getBookings(filters),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

/** The bookings list, a page at a time as it scrolls; also refreshed every 15 s. */
export function useBookingPages(filters: ListFilters) {
  return useInfiniteQuery({
    queryKey: bookingKeys.pages(filters),
    queryFn: ({ pageParam }) => getBookings({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

/** How many bookings each tab of the list holds. */
export function useBookingCounts(branchId: string, statuses: readonly BookingStatus[]) {
  return useQueries({
    queries: statuses.map((status) => {
      const filters = { status, branchId, pageSize: 1 };
      return {
        queryKey: bookingKeys.list(filters),
        queryFn: () => getBookings(filters),
        refetchInterval: LIVE_REFETCH_MS,
      };
    }),
    combine: (results) =>
      Object.fromEntries(
        statuses.map((status, index) => [status, results[index]?.data?.total]),
      ) as Record<BookingStatus, number | undefined>,
  });
}

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ""),
    queryFn: () => getBooking(id ?? ""),
    enabled: id !== null,
  });
}

/** After an answer, every booking list and the job lists (a new job card) are out of date. */
function useRefreshAfterAnswer() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    ]);
}

export function useAcceptBooking() {
  const refresh = useRefreshAfterAnswer();
  return useMutation({ mutationFn: acceptBooking, onSettled: refresh });
}

export function useDeclineBooking() {
  const refresh = useRefreshAfterAnswer();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => declineBooking(id, reason),
    onSettled: refresh,
  });
}
