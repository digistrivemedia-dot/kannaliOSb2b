import { useQuery } from "@tanstack/react-query";

import { useCart } from "@/features/cart/store";
import { useProductsById } from "@/features/catalog/queries";
import type { Product } from "@/features/catalog/types";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { apiClient } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import { calculateOrderTotals, DEFAULT_DELIVERY_RULE, type DeliveryRule } from "@/lib/pricing";

type CartLine = { product: Product; quantity: number; stock: number; issue: string | null };

/** Units of a product at the delivery branch. */
export function stockAt(product: Pick<Product, "stockByBranch">, branchId: string): number {
  return product.stockByBranch.find((stock) => stock.branchId === branchId)?.quantity ?? 0;
}

/**
 * What stops a line being ordered. The server refuses more than the branch's stock, so a short line
 * blocks checkout until it's lowered (the website let it through with a note).
 */
function lineIssue(product: Product, quantity: number, stock: number): string | null {
  if (stock === 0)
    return "Out of stock at your delivery branch. Remove it or choose another branch.";
  if (quantity > stock)
    return `Only ${formatCount(stock, product.unit)} at your delivery branch. Lower the quantity.`;
  return null;
}

/** The B2B delivery rule from the platform settings (FRONTEND-CHANGES F-42, F-48). */
export function useDeliveryRule(): DeliveryRule {
  const { data } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: () => apiClient.get<{ delivery: { b2b: DeliveryRule } }>("/settings/public"),
    staleTime: 30 * 60_000,
  });
  return data?.delivery.b2b ?? DEFAULT_DELIVERY_RULE;
}

/** The cart joined with fresh prices and stock at the delivery branch, and its totals. */
export function useCartLines() {
  const items = useCart((state) => state.items);
  const chosenBranch = useCart((state) => state.branchId);
  const activeBranch = useActiveBranch();
  const branchId = chosenBranch ?? activeBranch.id;
  const products = useProductsById(items.map((item) => item.productId));
  const rule = useDeliveryRule();
  const lines: CartLine[] = items.flatMap((item, index) => {
    const product = products.products[index];
    if (!product) return [];
    const stock = stockAt(product, branchId);
    return [
      { product, quantity: item.quantity, stock, issue: lineIssue(product, item.quantity, stock) },
    ];
  });
  const totals = calculateOrderTotals(
    lines.map((line) => ({
      quantity: line.quantity,
      unitPriceInPaise: line.product.businessPriceInPaise,
      listPriceInPaise: line.product.b2cPriceInPaise,
      gstRatePercent: line.product.gstRatePercent,
    })),
    rule,
  );
  return {
    lines,
    totals,
    branchId,
    isPending: products.isPending,
    error: products.error,
    refetch: products.refetch,
    isBlocked: lines.some((line) => line.issue !== null),
  };
}
