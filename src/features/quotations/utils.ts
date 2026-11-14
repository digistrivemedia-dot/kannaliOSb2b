import type { QuotationSummary } from "@/features/quotations/types";
import { daysFromToday, formatDate } from "@/lib/format";

/** "5 days left", "Last day today", "Ran out on 12 Nov 2026": for quotations Kannali has priced. */
export function validityText(
  quotation: Pick<QuotationSummary, "status" | "validUntil">,
  now = new Date(),
): string | null {
  if (!quotation.validUntil) return null;
  const days = daysFromToday(quotation.validUntil, now);
  if (quotation.status !== "quoted") return `Valid until ${formatDate(quotation.validUntil)}`;
  if (days < 0) return `Ran out on ${formatDate(quotation.validUntil)}`;
  if (days === 0) return "Last day today";
  return `${days} ${days === 1 ? "day" : "days"} left`;
}
