import type { Document, DocumentFilters } from "@/features/documents/types";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

export function getDocuments(
  filters: DocumentFilters & { page?: number; pageSize?: number },
): Promise<Paginated<Document>> {
  return apiClient.get<Paginated<Document>>("/documents", {
    ...filters,
    sort: "date",
    order: "desc",
  });
}
