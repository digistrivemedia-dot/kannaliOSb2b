import type { BranchReport, ReportFilters } from "@/features/reports/types";
import { apiClient } from "@/lib/api-client";

export function getBranchReport(filters: ReportFilters): Promise<BranchReport> {
  return apiClient.get<BranchReport>("/garage/reports", filters);
}
