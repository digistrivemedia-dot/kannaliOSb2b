import type {
  CatalogFilterOptions,
  CatalogFilters,
  Offer,
  Product,
} from "@/features/catalog/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getProducts(filters: CatalogFilters): Promise<Paginated<Product>> {
  const { brands, ...params } = filters;
  return apiClient.get<Paginated<Product>>("/catalog/products", {
    ...params,
    brands: brands?.join(","),
  });
}

export function getProduct(id: string): Promise<Product | null> {
  return orNull(apiClient.get<Product>(`/catalog/products/${encodeURIComponent(id)}`));
}

/** The parts with these part numbers; numbers that match nothing are simply missing. */
export function lookupPartNumbers(partNumbers: string[]): Promise<Product[]> {
  return apiClient.post<Product[]>("/catalog/products/lookup", { partNumbers });
}

export function getCatalogFilters(): Promise<CatalogFilterOptions> {
  return apiClient.get<CatalogFilterOptions>("/catalog/filters");
}

export function getOffers(): Promise<Offer[]> {
  return apiClient.get<Offer[]>("/promotions/offers");
}
