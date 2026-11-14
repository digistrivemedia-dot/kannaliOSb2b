import type { BranchRef } from "@/features/company/types";
import type { ListParams } from "@/lib/types";

// Copied from spareXB2B/src/features/orders/types.ts; the API returns exactly these shapes.

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/** Kannali marks bank transfers (and cash on delivery) as paid once the money arrives. */
export type PaymentMethod = "razorpay" | "bank_transfer" | "cod" | "credit";

export type RazorpayChannel = "upi" | "netbanking" | "card";

/**
 * "pending": not paid and not yet due (a credit order before its invoice, a bank transfer not yet
 * confirmed, or an online payment not finished). "refunded": paid, then cancelled and paid back.
 */
export type PaymentStatus = "pending" | "due" | "overdue" | "paid" | "refunded" | "cancelled";

export type OrderPayment = {
  method: PaymentMethod;
  status: PaymentStatus;
  channel?: RazorpayChannel;
  /** The Razorpay payment id, or the bank transfer's UTR when the buyer gave one. */
  reference?: string;
  /** Credit orders only: when the invoice falls due. */
  dueDate?: string;
  paidAt?: string;
};

export type OrderLine = {
  productId: string;
  partNumber: string;
  name: string;
  brand: string;
  quantity: number;
  /** Price per unit, excluding GST. */
  unitPriceInPaise: number;
  /** The B2C price per unit, which the discount and any quoted price are measured against. */
  listPriceInPaise: number;
  gstRatePercent: number;
};

export type OrderEvent = { status: OrderStatus; at: string };

export type CancellationReason =
  "ordered_by_mistake" | "duplicate" | "bought_elsewhere" | "not_needed" | "too_slow" | "other";

export type OrderCancellation = { reason: CancellationReason; note?: string; at: string };

export type Order = {
  id: string;
  number: string;
  poNumber?: string;
  poDate?: string;
  placedAt: string;
  expectedDeliveryDate?: string;
  branch: BranchRef;
  status: OrderStatus;
  itemCount: number;
  items: OrderLine[];
  subtotalInPaise: number;
  savingsInPaise: number;
  gstInPaise: number;
  deliveryInPaise: number;
  totalInPaise: number;
  payment: OrderPayment;
  quotationId?: string;
  notes?: string;
  cancellation?: OrderCancellation;
  timeline: OrderEvent[];
};

export type OrderSummary = Omit<Order, "items" | "timeline">;

export type OrderFilters = ListParams<"placedAt" | "totalInPaise"> & {
  /** Matches the order number or your PO number. */
  q?: string;
  statuses?: OrderStatus[];
  branchId?: string;
};

/**
 * What checkout sends. The server prices the lines itself. With a quotationId it orders that
 * quotation's lines at the quoted prices instead.
 */
export type PlaceOrderRequest = {
  quotationId?: string;
  branchId: string;
  poNumber?: string;
  notes?: string;
  payment:
    | { method: "razorpay"; channel: RazorpayChannel }
    | { method: "bank_transfer"; transferReference?: string }
    | { method: "credit" };
  items: { productId: string; quantity: number }[];
};

export type PlacedOrder = Pick<Order, "id" | "number">;

/** The payment window's proof (the demo window's, until Razorpay in Phase 10). */
export type PaymentProof = { gatewayOrderId: string; gatewayPaymentId: string; signature: string };
