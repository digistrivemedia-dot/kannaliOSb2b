import type {
  CreditSummary,
  Invoice,
  PayInvoicesRequest,
  Statement,
} from "@/features/credit/types";
import { apiClient } from "@/lib/api-client";

/** The business's credit: limit, used, available and what is overdue (`credit:view`). */
export function getCreditSummary(): Promise<CreditSummary> {
  return apiClient.get<CreditSummary>("/credit/summary");
}

/** The business's credit invoices: unpaid (due and overdue) or all. */
export function getCreditInvoices(status: "unpaid" | "all"): Promise<Invoice[]> {
  return apiClient.get<Invoice[]>("/credit/invoices", { status });
}

/** Entries between two days ("YYYY-MM-DD", India time), with the balance before and after. */
export function getStatement(from?: string, to?: string): Promise<Statement> {
  return apiClient.get<Statement>("/credit/statement", { from, to });
}

/** Pays invoices; a bank transfer waits for Kannali to confirm it. */
export function payInvoices(
  request: PayInvoicesRequest,
): Promise<{ paymentId: string; amountInPaise: number; isConfirmed: boolean }> {
  return apiClient.post("/credit/payments", request);
}
