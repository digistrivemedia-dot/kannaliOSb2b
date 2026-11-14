import type { CreateReturnRequest, ReturnRequest, ReturnSummary } from "@/features/returns/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getReturns(filters: {
  orderId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<ReturnSummary>> {
  return apiClient.get<Paginated<ReturnSummary>>("/returns", { ...filters, order: "desc" });
}

export function getReturn(id: string): Promise<ReturnRequest | null> {
  return orNull(apiClient.get<ReturnRequest>(`/returns/${encodeURIComponent(id)}`));
}

/** How many of each product of an order are already being returned, by product id. */
export function getReturnedQuantities(orderId: string): Promise<Record<string, number>> {
  return apiClient.get<Record<string, number>>(
    `/orders/${encodeURIComponent(orderId)}/returned-quantities`,
  );
}

export function createReturn(request: CreateReturnRequest): Promise<ReturnRequest> {
  return apiClient.post<ReturnRequest>("/returns", request);
}
