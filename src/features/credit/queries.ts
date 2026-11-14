import { useQuery } from "@tanstack/react-query";

import { getCreditSummary } from "@/features/credit/api";

export const creditKeys = {
  all: ["credit"] as const,
  summary: ["credit", "summary"] as const,
};

/** Only asked for when the business has credit and this user may see it. */
export function useCreditSummary({ enabled = true } = {}) {
  return useQuery({ queryKey: creditKeys.summary, queryFn: getCreditSummary, enabled });
}
