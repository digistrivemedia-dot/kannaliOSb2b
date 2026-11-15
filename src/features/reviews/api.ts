import type { Review, ReviewFilters, ReviewSummary } from "@/features/reviews/types";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

/** Newest first; the API takes page sizes of 10, 20, 50 or 100. */
export function getReviews(filters: ReviewFilters & { page?: number }): Promise<Paginated<Review>> {
  return apiClient.get<Paginated<Review>>("/garage/reviews", {
    ...filters,
    pageSize: 20,
    sort: "createdAt.desc",
  });
}

export function getReviewSummary(branchId?: string): Promise<ReviewSummary> {
  return apiClient.get<ReviewSummary>("/garage/reviews/summary", { branchId });
}
