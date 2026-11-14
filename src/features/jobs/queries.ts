import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  assignTechnician,
  checkIn,
  createWalkIn,
  getJobCard,
  getJobCards,
  getTechnicians,
  lookupVehicle,
} from "@/features/jobs/api";
import type { CheckInRequest, JobCard, JobCardFilters } from "@/features/jobs/types";
import { JOB_TABS, type JobTab } from "@/features/jobs/utils";
import { LIVE_REFETCH_MS } from "@/lib/constants";
import { nextPage } from "@/lib/paging";

type ListFilters = JobCardFilters & { from?: string; to?: string };

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: ListFilters) => ["jobs", "list", filters] as const,
  pages: (filters: ListFilters) => ["jobs", "pages", filters] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  technicians: (branchId: string) => ["jobs", "technicians", branchId] as const,
};

type ListOptions = {
  enabled?: boolean;
  /** Looks again every 15 s, for lists on Today that should stay current. */
  live?: boolean;
};

export function useJobCards(
  filters: ListFilters,
  { enabled = true, live = false }: ListOptions = {},
) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => getJobCards(filters),
    enabled,
    refetchInterval: live ? LIVE_REFETCH_MS : false,
  });
}

/** The job list, a page at a time as it scrolls. */
export function useJobPages(filters: ListFilters) {
  return useInfiniteQuery({
    queryKey: jobKeys.pages(filters),
    queryFn: ({ pageParam }) => getJobCards({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

/** How many jobs the branch has in each of these tabs. One small request per tab. */
export function useJobCounts(
  branchId: string,
  tabs: readonly JobTab[],
  extra: Omit<ListFilters, "statuses" | "branchId"> = {},
) {
  return useQueries({
    queries: tabs.map((tab) => {
      const filters = { ...extra, statuses: JOB_TABS[tab].statuses, branchId, pageSize: 1 };
      return {
        queryKey: jobKeys.list(filters),
        queryFn: () => getJobCards(filters),
        refetchInterval: LIVE_REFETCH_MS,
      };
    }),
    combine: (results) => ({
      counts: Object.fromEntries(
        tabs.map((tab, index) => [tab, results[index]?.data?.total]),
      ) as Partial<Record<JobTab, number>>,
      isPending: results.some((result) => result.isPending),
      error: results.find((result) => result.error)?.error ?? null,
      refetch: () => Promise.all(results.map((result) => result.refetch())),
    }),
  });
}

export function useJobCard(id: string | null) {
  return useQuery({
    queryKey: jobKeys.detail(id ?? ""),
    queryFn: () => getJobCard(id ?? ""),
    enabled: id !== null,
  });
}

/** The vehicle on file for a plate; nothing is asked until the plate is complete. */
export function useVehicleLookup(plate: string | null) {
  return useQuery({
    queryKey: ["vehicles", "lookup", plate],
    queryFn: () => lookupVehicle(plate ?? ""),
    enabled: plate !== null,
  });
}

export function useTechnicians(branchId: string, { enabled = true } = {}) {
  return useQuery({
    queryKey: jobKeys.technicians(branchId),
    queryFn: () => getTechnicians(branchId),
    enabled,
  });
}

/**
 * After any change to a job: the card answers itself (so it shows at once), and every list and
 * count is out of date.
 */
export function useJobChanged() {
  const queryClient = useQueryClient();
  return (job: JobCard) => {
    queryClient.setQueryData(jobKeys.detail(job.id), job);
    void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };
}

export function useCreateWalkIn() {
  const changed = useJobChanged();
  return useMutation({ mutationFn: createWalkIn, onSuccess: changed });
}

export function useCheckIn(id: string) {
  const changed = useJobChanged();
  return useMutation({
    mutationFn: (request: CheckInRequest) => checkIn(id, request),
    onSuccess: changed,
  });
}

export function useAssignTechnician(id: string) {
  const changed = useJobChanged();
  return useMutation({
    mutationFn: (technicianId: string) => assignTechnician(id, technicianId),
    onSuccess: changed,
  });
}
