import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCreditInvoices,
  getCreditSummary,
  getStatement,
  payInvoices,
} from "@/features/credit/api";

const creditKeys = {
  all: ["credit"] as const,
  summary: ["credit", "summary"] as const,
};

/** Only asked for when the business has credit and this user may see it. */
export function useCreditSummary({ enabled = true } = {}) {
  return useQuery({ queryKey: creditKeys.summary, queryFn: getCreditSummary, enabled });
}

export function useCreditInvoices(status: "unpaid" | "all", { enabled = true } = {}) {
  return useQuery({
    queryKey: ["credit", "invoices", status],
    queryFn: () => getCreditInvoices(status),
    enabled,
  });
}

export function useStatement(
  from: string | undefined,
  to: string | undefined,
  { enabled = true } = {},
) {
  return useQuery({
    queryKey: ["credit", "statement", from, to],
    queryFn: () => getStatement(from, to),
    enabled,
  });
}

export function usePayInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payInvoices,
    onSuccess: () =>
      Promise.all(
        [creditKeys.all, ["payments"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
    retry: false,
  });
}
