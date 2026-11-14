import type {
  CancellationReason,
  Order,
  OrderFilters,
  OrderSummary,
  PaymentProof,
  PlaceOrderRequest,
  PlacedOrder,
} from "@/features/orders/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

const order = (id: string) => `/orders/${encodeURIComponent(id)}`;

export function getOrders(filters: OrderFilters): Promise<Paginated<OrderSummary>> {
  const { statuses, ...params } = filters;
  return apiClient.get<Paginated<OrderSummary>>("/orders", {
    ...params,
    statuses: statuses?.join(","),
  });
}

export function getOrder(id: string): Promise<Order | null> {
  return orNull(apiClient.get<Order>(order(id)));
}

export function placeOrder(request: PlaceOrderRequest): Promise<PlacedOrder> {
  return apiClient.post<PlacedOrder>("/orders", request);
}

export function cancelOrder(id: string, reason: CancellationReason, note?: string): Promise<Order> {
  return apiClient.post<Order>(`${order(id)}/cancel`, { reason, note: note || undefined });
}

/**
 * Pays an online order through the demo payment window (FRONTEND-CHANGES F-31, F-32): open a payment
 * session, let the demo window answer, then send its proof to be verified. Razorpay's own window
 * replaces the middle step in Phase 10.
 */
export async function payOrderDemo(id: string, outcome: "success" | "failure"): Promise<Order> {
  await apiClient.post(`${order(id)}/payment`, {});
  const proof = await apiClient.post<PaymentProof>(`${order(id)}/payment/demo`, {
    outcome,
    method: "upi",
  });
  return apiClient.post<Order>(`${order(id)}/payment/verify`, proof);
}
