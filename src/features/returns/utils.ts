import type { RefundMethod, ReturnReason } from "@/features/returns/types";

export const RETURN_REASONS: Record<ReturnReason, string> = {
  damaged_in_transit: "Damaged in transit",
  wrong_part: "Wrong part sent",
  does_not_fit: "Doesn't fit the vehicle",
  defective: "Defective",
  not_needed: "Not needed any more",
};

export const REFUND_METHODS: Record<RefundMethod, string> = {
  credit_note: "As a credit note on your account",
  original_payment: "The way you paid",
};

/** Return photos go inline, up to 512 KB each (the backend's limit); a little under, to be safe. */
export const MAX_RETURN_PHOTO_BYTES = 480 * 1024;
