import { useQueries, useQuery } from "@tanstack/react-query";

import { getJobCard, getJobCards } from "@/features/jobs/api";
import type { JobCardFilters } from "@/features/jobs/types";
import { JOB_COUNT_GROUPS, type JobCountGroup } from "@/features/jobs/utils";
import { LIVE_REFETCH_MS } from "@/lib/constants";

export const jobKeys = {
  list: (filters: JobCardFilters) => ["jobs", "list", filters] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
};

type ListOptions = {
  enabled?: boolean;
  /** Looks again every 15 s, for lists on Today that should stay current. */
  live?: boolean;
};

export function useJobCards(filters: JobCardFilters, { enabled = true, live = false }: ListOptions = {}) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => getJobCards(filters),
    enabled,
    refetchInterval: live ? LIVE_REFETCH_MS : false,
  });
}

/** How many jobs the branch has in each of Today's count groups. One small request per group. */
export function useJobCounts(branchId: string) {
  const groups = Object.keys(JOB_COUNT_GROUPS) as JobCountGroup[];
  return useQueries({
    queries: groups.map((group) => {
      const filters = { statuses: JOB_COUNT_GROUPS[group].statuses, branchId, pageSize: 1 };
      return {
        queryKey: jobKeys.list(filters),
        queryFn: () => getJobCards(filters),
        refetchInterval: LIVE_REFETCH_MS,
      };
    }),
    combine: (results) => ({
      counts: Object.fromEntries(
        groups.map((group, index) => [group, results[index]?.data?.total]),
      ) as Record<JobCountGroup, number | undefined>,
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
