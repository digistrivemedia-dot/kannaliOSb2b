import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getBranchReport } from "@/features/reports/api";
import type { ReportFilters } from "@/features/reports/types";

export function useBranchReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => getBranchReport(filters),
    placeholderData: keepPreviousData,
  });
}
