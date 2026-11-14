import type {
  Quotation,
  QuotationRequest,
  QuotationStatus,
  QuotationSummary,
} from "@/features/quotations/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

const quotation = (id: string) => `/quotations/${encodeURIComponent(id)}`;

export function getQuotations(filters: {
  status?: QuotationStatus;
  sort?: "requestedAt" | "validUntil";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}): Promise<Paginated<QuotationSummary>> {
  return apiClient.get<Paginated<QuotationSummary>>("/quotations", filters);
}

export function getQuotation(id: string): Promise<Quotation | null> {
  return orNull(apiClient.get<Quotation>(quotation(id)));
}

export function requestQuotation(request: QuotationRequest): Promise<Quotation> {
  return apiClient.post<Quotation>("/quotations", request);
}

/** Sends the quotation back to Kannali with a comment, to be priced again. */
export function requestRevision(id: string, comment: string): Promise<Quotation> {
  return apiClient.post<Quotation>(`${quotation(id)}/revision`, { comment });
}

export function rejectQuotation(id: string, reason?: string): Promise<Quotation> {
  return apiClient.post<Quotation>(`${quotation(id)}/reject`, { reason: reason || undefined });
}
