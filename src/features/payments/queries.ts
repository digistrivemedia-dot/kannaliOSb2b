import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getPayment, getPayments } from "@/features/payments/api";
import type { Payment } from "@/features/payments/types";
import { nextPage } from "@/lib/paging";

export function usePaymentPages(status: Payment["status"] | undefined) {
  return useInfiniteQuery({
    queryKey: ["payments", "pages", status],
    queryFn: ({ pageParam }) => getPayments({ status, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function usePayment(id: string | null) {
  return useQuery({
    queryKey: ["payments", "detail", id],
    queryFn: () => getPayment(id ?? ""),
    enabled: id !== null,
  });
}
