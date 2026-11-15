import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getCustomer, getCustomers } from "@/features/customers/api";
import { nextPage } from "@/lib/paging";

export function useCustomerPages(q: string) {
  return useInfiniteQuery({
    queryKey: ["customers", "pages", q],
    queryFn: ({ pageParam }) => getCustomers({ q: q || undefined, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: () => getCustomer(id ?? ""),
    enabled: id !== null,
  });
}
