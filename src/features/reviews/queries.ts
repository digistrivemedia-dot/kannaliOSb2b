import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getReviews, getReviewSummary } from "@/features/reviews/api";
import type { ReviewFilters } from "@/features/reviews/types";
import { nextPage } from "@/lib/paging";

export function useReviewPages(filters: ReviewFilters) {
  return useInfiniteQuery({
    queryKey: ["reviews", "pages", filters],
    queryFn: ({ pageParam }) => getReviews({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useReviewSummary(branchId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", "summary", branchId],
    queryFn: () => getReviewSummary(branchId),
  });
}
