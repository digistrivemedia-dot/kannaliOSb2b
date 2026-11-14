import { router } from "expo-router";
import { ShoppingCart, Trash2 } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconButton } from "@/components/ui/IconButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { OrderTotals } from "@/features/cart/components/OrderTotals";
import { useCart } from "@/features/cart/store";
import { useCartLines, useDeliveryRule } from "@/features/cart/use-cart-lines";
import { formatPrice } from "@/lib/format";

/** G54: lines with steppers, savings against retail, stock warnings, and the totals; then Checkout. */
export function CartScreen() {
  const cart = useCartLines();
  const rule = useDeliveryRule();
  const { setQuantity, remove } = useCart();
  const isEmpty = useCart((state) => state.items.length === 0);

  return (
    <Screen
      header={<Header title="Cart" subtitle="Prices excl. GST" />}
      onRefresh={cart.refetch}
      bottomBar={
        isEmpty ? undefined : (
          <BottomBar>
            <Button
              size="main"
              label={
                cart.isBlocked
                  ? "Fix the lines marked in red"
                  : `Checkout · ${formatPrice(cart.totals.totalInPaise)}`
              }
              onPress={() => router.push("/checkout")}
              disabled={cart.isBlocked || cart.isPending}
            />
          </BottomBar>
        )
      }
    >
      {isEmpty ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          message="Find parts by name or part number, or reorder an earlier order."
          action={{ label: "Order by part number", onPress: () => router.replace("/quick-order") }}
        />
      ) : cart.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-32 w-full" />
          <Skeleton shape="card" className="h-32 w-full" />
        </View>
      ) : cart.error ? (
        <ErrorState error={cart.error} onRetry={() => void cart.refetch()} what="your cart" />
      ) : (
        <>
          {cart.lines.map(({ product, quantity, issue }) => (
            <Card key={product.id} className={issue ? "gap-2 border-danger-600" : "gap-2"}>
              <View className="flex-row items-start gap-2">
                <View className="flex-1">
                  <Text weight="semibold">{product.name}</Text>
                  <Text variant="small" tone="muted">
                    {product.partNumber} · {formatPrice(product.businessPriceInPaise)} each · retail{" "}
                    {formatPrice(product.b2cPriceInPaise)}
                  </Text>
                </View>
                <IconButton
                  icon={Trash2}
                  label={`Remove ${product.name}`}
                  onPress={() => remove(product.id)}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <QuantityStepper
                  value={quantity}
                  onChange={(next) => setQuantity(product.id, next)}
                />
                <Text weight="semibold" tabular>
                  {formatPrice(product.businessPriceInPaise * quantity)}
                </Text>
              </View>
              {issue ? (
                <Text variant="small" tone="danger" weight="medium">
                  {issue}
                </Text>
              ) : null}
            </Card>
          ))}
          <Card>
            <OrderTotals totals={cart.totals} rule={rule} />
          </Card>
        </>
      )}
    </Screen>
  );
}
