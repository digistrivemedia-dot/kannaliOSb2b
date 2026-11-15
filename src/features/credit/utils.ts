import type { CreditSummary } from "@/features/credit/types";
import { formatPrice } from "@/lib/format";

/**
 * Why an order can't go on credit, or null when it can (website checkout rule): overdue invoices
 * block it first, then an order larger than what is left of the limit.
 */
export function creditBlockReason(
  summary: Pick<CreditSummary, "availableInPaise" | "overdueInvoiceCount"> | undefined,
  orderTotalInPaise: number,
): string | null {
  if (!summary) return null;
  if (summary.overdueInvoiceCount > 0) return "Pay your overdue invoices first.";
  if (summary.availableInPaise < orderTotalInPaise) {
    return `Only ${formatPrice(summary.availableInPaise)} of credit left.`;
  }
  return null;
}
