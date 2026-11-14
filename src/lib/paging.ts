import type { Paginated } from "@/lib/types";

/** The next page to ask for, or undefined at the end of the list (for useInfiniteQuery). */
export function nextPage<T>(last: Paginated<T>): number | undefined {
  return last.page * last.pageSize < last.total ? last.page + 1 : undefined;
}

/** Every item of the pages loaded so far. */
export function allItems<T>(pages: Paginated<T>[] | undefined): T[] {
  return pages?.flatMap((page) => page.items) ?? [];
}
