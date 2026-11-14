import type { Payment } from "@/features/payments/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getPayments(filters: {
  status?: Payment["status"];
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Payment>> {
  return apiClient.get<Paginated<Payment>>("/payments", { ...filters, order: "desc" });
}

export function getPayment(id: string): Promise<Payment | null> {
  return orNull(apiClient.get<Payment>(`/payments/${encodeURIComponent(id)}`));
}
