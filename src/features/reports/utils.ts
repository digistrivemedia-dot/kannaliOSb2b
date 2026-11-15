import { z } from "zod";

import type { ReportRange } from "@/features/reports/filter-store";
import { parseTypedDate } from "@/lib/dates";
import { formatDate } from "@/lib/format";

export const RANGE_LABELS: Record<ReportRange, string> = {
  today: "Today",
  week: "Last 7 days",
  month: "Last 30 days",
  this_month: "This month",
  last_month: "Last month",
  custom: "Pick dates",
};

const addDays = (day: string, days: number) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** The first and last day (India time, inclusive) of a range, counted from `today` ("YYYY-MM-DD"). */
export function rangeDates(
  range: ReportRange,
  today: string,
  custom: { from: string | null; to: string | null },
): { from: string; to: string } {
  const monthStart = `${today.slice(0, 8)}01`;
  switch (range) {
    case "today":
      return { from: today, to: today };
    case "week":
      return { from: addDays(today, -6), to: today };
    case "this_month":
      return { from: monthStart, to: today };
    case "last_month": {
      const lastDay = addDays(monthStart, -1);
      return { from: `${lastDay.slice(0, 8)}01`, to: lastDay };
    }
    case "custom":
      if (custom.from && custom.to) return { from: custom.from, to: custom.to };
      return { from: addDays(today, -29), to: today };
    default:
      return { from: addDays(today, -29), to: today };
  }
}

/** "Last 30 days" or "1 Nov 2026 – 15 Nov 2026" for a custom range. */
export function describeRange(range: ReportRange, dates: { from: string; to: string }): string {
  if (range !== "custom") return RANGE_LABELS[range];
  return dates.from === dates.to
    ? formatDate(dates.from)
    : `${formatDate(dates.from)} – ${formatDate(dates.to)}`;
}

/** A custom range: two real dates, typed DD/MM/YYYY, the first not after the last. */
export const customRangeSchema = z
  .object({
    from: z
      .string()
      .refine((value) => parseTypedDate(value) !== null, "Enter both dates, like 01/11/2026."),
    to: z
      .string()
      .refine((value) => parseTypedDate(value) !== null, "Enter both dates, like 01/11/2026."),
  })
  .refine(
    ({ from, to }) => (parseTypedDate(from) ?? "") <= (parseTypedDate(to) ?? ""),
    "The first date must come before the last.",
  );
