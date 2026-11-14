import type {
  CancellationReason,
  OrderPayment,
  OrderStatus,
  PaymentMethod,
} from "@/features/orders/types";
import { formatDate } from "@/lib/format";

// Words from spareXB2B (orders and checkout), for a phone.

export const CANCEL_REASONS: Record<CancellationReason, string> = {
  ordered_by_mistake: "Ordered by mistake",
  duplicate: "Placed it twice",
  bought_elsewhere: "Bought it elsewhere",
  not_needed: "Don't need it any more",
  too_slow: "Delivery takes too long",
  other: "Other",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  razorpay: "Online",
  bank_transfer: "Bank transfer",
  cod: "Cash on delivery",
  credit: "Credit",
};

/** Orders can be cancelled until they ship (CLAUDE.md §8). */
export function isCancellable(status: OrderStatus): boolean {
  return ["placed", "confirmed", "processing", "packed"].includes(status);
}

/** Where a payment stands, in words: "Waiting for Kannali to confirm the transfer". */
export function paymentText(payment: OrderPayment): string {
  if (payment.status === "paid")
    return `Paid${payment.paidAt ? ` on ${formatDate(payment.paidAt)}` : ""}`;
  if (payment.status === "refunded") return "Refunded";
  if (payment.status === "cancelled") return "Not paid; the order was cancelled";
  if (payment.method === "bank_transfer") return "Waiting for Kannali to confirm the transfer";
  if (payment.method === "credit") {
    return payment.dueDate
      ? `On credit, due ${formatDate(payment.dueDate)}`
      : "On credit: invoiced when it ships";
  }
  if (payment.method === "razorpay") return "Online payment not finished";
  return "Pay on delivery";
}

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];
