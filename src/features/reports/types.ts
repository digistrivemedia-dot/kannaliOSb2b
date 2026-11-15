import type { JobStatus } from "@/features/jobs/types";

// Copied from spareXB2B/src/features/reports/types.ts; the API returns exactly these shapes.

export type ReportFilters = {
  /** Every branch when absent. */
  branchId?: string;
  /** "YYYY-MM-DD", India time, inclusive. */
  from: string;
  to: string;
};

/** A branch's (or every branch's) numbers for a date range. */
export type BranchReport = {
  jobsCompleted: number;
  /** Paid invoices in the range, including GST. */
  revenueInPaise: number;
  averageJobValueInPaise: number;
  /** Jobs open right now, by status. */
  openByStatus: { status: JobStatus; count: number }[];
  technicians: { id: string; name: string; completed: number; active: number }[];
  topServices: { name: string; count: number; revenueInPaise: number }[];
};
