import type { PaymentMethod } from "@/features/orders/types";

/** Money the business paid Kannali, and what it settled (`GET /payments`). */
export type Payment = {
  id: string;
  date: string;
  method: PaymentMethod;
  reference?: string;
  /** Including GST. */
  amountInPaise: number;
  appliedTo: { kind: "order" | "invoice"; id: string; number: string; amountInPaise: number }[];
  status: "successful" | "awaiting_confirmation" | "failed";
};
