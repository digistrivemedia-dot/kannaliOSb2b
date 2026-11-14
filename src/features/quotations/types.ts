import type { BranchRef } from "@/features/company/types";

// Copied from spareXB2B/src/features/quotations/types.ts; the API returns exactly these shapes.

export type QuotationStatus = "requested" | "quoted" | "accepted" | "rejected" | "expired";

export type QuotationLine = {
  productId: string;
  partNumber: string;
  name: string;
  brand: string;
  quantity: number;
  /** This business's price per unit, excluding GST. */
  listPriceInPaise: number;
  /** The quoted price per unit, excluding GST. */
  quotedPriceInPaise?: number;
  gstRatePercent: number;
};

export type QuotationEvent = { status: QuotationStatus; at: string; note?: string };

export type Quotation = {
  id: string;
  number: string;
  status: QuotationStatus;
  requestedAt: string;
  quotedAt?: string;
  /** The last day the quoted prices hold, "YYYY-MM-DD" (India time). */
  validUntil?: string;
  branch: BranchRef;
  itemCount: number;
  items: QuotationLine[];
  subtotalInPaise?: number;
  gstInPaise?: number;
  totalInPaise?: number;
  customerNotes?: string;
  kannaliNotes?: string;
  /** Set once the quotation is accepted and ordered. */
  order?: { id: string; number: string };
  timeline: QuotationEvent[];
};

export type QuotationSummary = Omit<Quotation, "items" | "timeline">;

export type QuotationRequest = {
  branchId: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
};
