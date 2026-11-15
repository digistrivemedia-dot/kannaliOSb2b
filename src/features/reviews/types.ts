import type { BranchRef } from "@/features/company/types";

// Copied from spareXB2B/src/features/reviews/types.ts; the API returns exactly these shapes.

/** A customer's review after a job, from the SpareX app. */
export type Review = {
  id: string;
  /** 1 to 5 stars. */
  rating: number;
  comment?: string;
  customerName: string;
  job: { id: string; number: string };
  branch: BranchRef;
  createdAt: string;
};

export type ReviewFilters = { rating?: number; branchId?: string };

export type ReviewSummary = {
  average: number;
  count: number;
  /** How many reviews gave each number of stars, 5 down to 1. */
  byRating: { rating: number; count: number }[];
};
