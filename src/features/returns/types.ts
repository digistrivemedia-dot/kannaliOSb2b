import type { BranchRef } from "@/features/company/types";

// Copied from spareXB2B/src/features/returns/types.ts; the API returns exactly these shapes.

export type ReturnStatus = "requested" | "approved" | "picked_up" | "refunded" | "rejected";

export type ReturnReason =
  "damaged_in_transit" | "wrong_part" | "does_not_fit" | "defective" | "not_needed";

export type ReturnLine = {
  productId: string;
  partNumber: string;
  name: string;
  quantity: number;
  /** The price paid per unit, excluding GST. */
  unitPriceInPaise: number;
  gstRatePercent: number;
};

/** Credit customers get a credit note; everyone else is refunded the way they paid. */
export type RefundMethod = "credit_note" | "original_payment";

export type ReturnEvent = { status: ReturnStatus; at: string; note?: string };

export type ReturnRequest = {
  id: string;
  number: string;
  order: { id: string; number: string };
  branch: BranchRef;
  status: ReturnStatus;
  requestedAt: string;
  reason: ReturnReason;
  notes?: string;
  photos: string[];
  items: ReturnLine[];
  itemCount: number;
  /** Refunded once Kannali receives the parts, including GST. */
  refundInPaise: number;
  refundMethod: RefundMethod;
  rejectionReason?: string;
  timeline: ReturnEvent[];
};

export type ReturnSummary = Omit<ReturnRequest, "items" | "timeline" | "photos">;

/** Photos go inline as data URLs. */
export type CreateReturnRequest = {
  orderId: string;
  reason: ReturnReason;
  notes?: string;
  photos: string[];
  items: { productId: string; quantity: number }[];
};
