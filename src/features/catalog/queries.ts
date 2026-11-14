import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";

import {
  getCatalogFilters,
  getOffers,
  getProduct,
  getProducts,
  lookupPartNumbers,
} from "@/features/catalog/api";
import type { CatalogFilters } from "@/features/catalog/types";
import { nextPage } from "@/lib/paging";

export const catalogKeys = {
  products: (filters: CatalogFilters) => ["catalog", "products", filters] as const,
  product: (id: string) => ["catalog", "product", id] as const,
};

export function useProductPages(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: catalogKeys.products(filters),
    queryFn: ({ pageParam }) => getProducts({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: catalogKeys.product(id ?? ""),
    queryFn: () => getProduct(id ?? ""),
    enabled: id !== null,
  });
}

/** Many products at once (the cart's lines), each cached on its own. */
export function useProductsById(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: catalogKeys.product(id),
      queryFn: () => getProduct(id),
    })),
    combine: (results) => ({
      products: results.map((result) => result.data ?? null),
      isPending: results.some((result) => result.isPending),
      error: results.find((result) => result.error)?.error ?? null,
      refetch: () => Promise.all(results.map((result) => result.refetch())),
    }),
  });
}

export function useCatalogFilters() {
  return useQuery({
    queryKey: ["catalog", "filters"],
    queryFn: getCatalogFilters,
    staleTime: 10 * 60_000,
  });
}

export function useOffers() {
  return useQuery({
    queryKey: ["promotions", "offers"],
    queryFn: getOffers,
    staleTime: 10 * 60_000,
  });
}

/** Checks typed or pasted part numbers against the catalogue. */
export function usePartNumberLookup(partNumbers: string[]) {
  return useQuery({
    queryKey: ["catalog", "lookup", partNumbers],
    queryFn: () => lookupPartNumbers(partNumbers),
    enabled: partNumbers.length > 0,
  });
}
