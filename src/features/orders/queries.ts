import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelOrder, getOrder, getOrders, payOrderDemo, placeOrder } from "@/features/orders/api";
import type { CancellationReason, OrderFilters } from "@/features/orders/types";
import { nextPage } from "@/lib/paging";

const orderKeys = {
  all: ["orders"] as const,
  list: (filters: OrderFilters) => ["orders", "list", filters] as const,
  pages: (filters: OrderFilters) => ["orders", "pages", filters] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

/** For a screen's pull to refresh when an order list on it loads itself (Recent orders). */
export function useRefetchOrders() {
  const queryClient = useQueryClient();
  return () => queryClient.refetchQueries({ queryKey: orderKeys.all, type: "active" });
}

export function useOrders(filters: OrderFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrders(filters),
    enabled,
  });
}

export function useOrderPages(filters: OrderFilters) {
  return useInfiniteQuery({
    queryKey: orderKeys.pages(filters),
    queryFn: ({ pageParam }) => getOrders({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => getOrder(id ?? ""),
    enabled: id !== null,
  });
}

/** Orders, credit and documents all change when an order does. */
function useRefreshOrders() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [orderKeys.all, ["credit"], ["quotations"], ["catalog", "products"]].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
}

export function usePlaceOrder() {
  const refresh = useRefreshOrders();
  return useMutation({ mutationFn: placeOrder, onSuccess: refresh, retry: false });
}

export function useCancelOrder(id: string) {
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: ({ reason, note }: { reason: CancellationReason; note?: string }) =>
      cancelOrder(id, reason, note),
    onSuccess: refresh,
  });
}

export function usePayOrderDemo(id: string) {
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: (outcome: "success" | "failure") => payOrderDemo(id, outcome),
    onSuccess: refresh,
    retry: false,
  });
}
