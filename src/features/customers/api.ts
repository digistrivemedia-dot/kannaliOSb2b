import type { CustomerDetail, CustomerSummary } from "@/features/customers/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

/** The garage's customers; `q` matches name, phone or plate. */
export function getCustomers(filters: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<CustomerSummary>> {
  return apiClient.get<Paginated<CustomerSummary>>("/garage/customers", {
    ...filters,
    sort: "name",
    order: "asc",
  });
}

export function getCustomer(id: string): Promise<CustomerDetail | null> {
  return orNull(apiClient.get<CustomerDetail>(`/garage/customers/${encodeURIComponent(id)}`));
}
