import { router } from "expo-router";
import { useState } from "react";

import { showToast } from "@/components/ui/Toast";
import { useCart } from "@/features/cart/store";
import { getOrder } from "@/features/orders/api";
import { errorMessage } from "@/lib/api-client";
import { formatCount } from "@/lib/format";

/** Puts an earlier order's parts back in the cart, at today's prices, and opens the cart. */
export function useReorder() {
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const reorder = async (orderId: string) => {
    setReorderingId(orderId);
    try {
      const order = await getOrder(orderId);
      if (!order) throw new Error("not found");
      useCart
        .getState()
        .add(order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
      showToast({ message: `${formatCount(order.items.length, "part")} added to the cart` });
      router.push("/cart");
    } catch (error) {
      showToast({ message: errorMessage(error), tone: "danger" });
    } finally {
      setReorderingId(null);
    }
  };
  return { reorder, reorderingId };
}
