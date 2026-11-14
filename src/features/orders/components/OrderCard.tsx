import { router } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import type { OrderSummary } from "@/features/orders/types";
import { PAYMENT_METHOD_LABELS } from "@/features/orders/utils";
import { formatDate, formatPrice } from "@/lib/format";

type OrderCardProps = {
  order: OrderSummary;
  onReorder: () => void;
  isReordering: boolean;
};

/** An order in the list: number, date, amount, payment, status, and Reorder. */
export function OrderCard({ order, onReorder, isReordering }: OrderCardProps) {
  return (
    <Card className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Order ${order.number}, ${formatPrice(order.totalInPaise)}`}
        onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
        className="gap-1.5"
      >
        <View className="flex-row items-center justify-between gap-2">
          <Text weight="semibold">{order.number}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text variant="small" tone="muted">
          {formatDate(order.placedAt)} · {order.itemCount} items · {order.branch.name}
          {order.poNumber ? ` · PO ${order.poNumber}` : ""}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text weight="semibold" tabular>
            {formatPrice(order.totalInPaise)}{" "}
            <Text variant="label" tone="muted">
              incl. GST
            </Text>
          </Text>
          <View className="flex-row items-center gap-2">
            <Text variant="small" tone="muted">
              {PAYMENT_METHOD_LABELS[order.payment.method]}
            </Text>
            <StatusBadge status={order.payment.status} />
          </View>
        </View>
      </Pressable>
      <Button
        variant="outline"
        icon={RotateCcw}
        label="Reorder"
        onPress={onReorder}
        loading={isReordering}
      />
    </Card>
  );
}
