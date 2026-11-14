import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getDocuments } from "@/features/documents/api";
import type { DocumentFilters } from "@/features/documents/types";
import { nextPage } from "@/lib/paging";

export function useDocumentPages(filters: DocumentFilters) {
  return useInfiniteQuery({
    queryKey: ["documents", "pages", filters],
    queryFn: ({ pageParam }) => getDocuments({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

/**
 * An order's GST invoice. The order itself doesn't carry it (BACKEND-NEEDS BN-11), so it is found among
 * the documents by the order it belongs to; only for those who may see documents.
 */
export function useOrderInvoice(orderId: string, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["documents", "order-invoice", orderId],
    queryFn: async () => {
      const page = await getDocuments({ kind: "invoice", pageSize: 100 });
      return (
        page.items.find((document) => document.relatedTo?.href.endsWith(`/${orderId}`)) ?? null
      );
    },
    enabled,
  });
}
