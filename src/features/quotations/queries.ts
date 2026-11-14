import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getQuotation,
  getQuotations,
  rejectQuotation,
  requestQuotation,
  requestRevision,
} from "@/features/quotations/api";
import type { QuotationStatus } from "@/features/quotations/types";
import { nextPage } from "@/lib/paging";

export const quotationKeys = {
  all: ["quotations"] as const,
  detail: (id: string) => ["quotations", "detail", id] as const,
};

export function useQuotations(
  filters: { status?: QuotationStatus; pageSize?: number },
  { enabled = true } = {},
) {
  return useQuery({
    queryKey: ["quotations", "list", filters],
    queryFn: () => getQuotations({ ...filters, sort: "requestedAt", order: "desc" }),
    enabled,
  });
}

export function useQuotationPages(status: QuotationStatus | undefined) {
  return useInfiniteQuery({
    queryKey: ["quotations", "pages", status],
    queryFn: ({ pageParam }) =>
      getQuotations({ status, sort: "requestedAt", order: "desc", page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useQuotation(id: string | null) {
  return useQuery({
    queryKey: quotationKeys.detail(id ?? ""),
    queryFn: () => getQuotation(id ?? ""),
    enabled: id !== null,
  });
}

function useRefreshQuotations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: quotationKeys.all });
}

export function useRequestQuotation() {
  const refresh = useRefreshQuotations();
  return useMutation({ mutationFn: requestQuotation, onSuccess: refresh, retry: false });
}

export function useAnswerQuotation(id: string) {
  const refresh = useRefreshQuotations();
  return useMutation({
    mutationFn: ({ kind, text }: { kind: "revision" | "reject"; text: string }) =>
      kind === "revision" ? requestRevision(id, text) : rejectQuotation(id, text),
    onSuccess: refresh,
  });
}
