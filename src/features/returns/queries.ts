import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createReturn, getReturn, getReturnedQuantities, getReturns } from "@/features/returns/api";
import { nextPage } from "@/lib/paging";

export function useReturnPages() {
  return useInfiniteQuery({
    queryKey: ["returns", "pages"],
    queryFn: ({ pageParam }) => getReturns({ page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useReturn(id: string | null) {
  return useQuery({
    queryKey: ["returns", "detail", id],
    queryFn: () => getReturn(id ?? ""),
    enabled: id !== null,
  });
}

export function useReturnedQuantities(orderId: string | null) {
  return useQuery({
    queryKey: ["returns", "returned", orderId],
    queryFn: () => getReturnedQuantities(orderId ?? ""),
    enabled: orderId !== null,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReturn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["returns"] }),
  });
}
