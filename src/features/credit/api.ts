import type { CreditSummary } from "@/features/credit/types";
import { apiClient } from "@/lib/api-client";

/** The business's credit: limit, used, available and what is overdue (`credit:view`). */
export function getCreditSummary(): Promise<CreditSummary> {
  return apiClient.get<CreditSummary>("/credit/summary");
}
