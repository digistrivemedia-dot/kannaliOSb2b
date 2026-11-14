import type { JobCard, JobCardFilters, JobCardSummary } from "@/features/jobs/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getJobCards(filters: JobCardFilters): Promise<Paginated<JobCardSummary>> {
  const { statuses, ...params } = filters;
  return apiClient.get<Paginated<JobCardSummary>>("/garage/jobs", {
    ...params,
    statuses: statuses?.join(","),
  });
}

/** One job card with everything done on it so far, or null if there is none. */
export function getJobCard(id: string): Promise<JobCard | null> {
  return orNull(apiClient.get<JobCard>(`/garage/jobs/${encodeURIComponent(id)}`));
}
