import { useQuery } from "@tanstack/react-query";

import { getBranches } from "@/features/company/api";

export const companyKeys = {
  branches: ["company", "branches"] as const,
};

export function useBranches() {
  return useQuery({ queryKey: companyKeys.branches, queryFn: getBranches, staleTime: 5 * 60_000 });
}
