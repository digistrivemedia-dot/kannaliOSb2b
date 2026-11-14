import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { formatPrice } from "@/lib/format";
import type { DeliveryRule, OrderTotals as Totals } from "@/lib/pricing";

/** Subtotal excl. GST, savings, delivery, GST on its own line, then the total incl. GST. */
export function OrderTotals({ totals, rule }: { totals: Totals; rule?: DeliveryRule }) {
  return (
    <View className="gap-1.5">
      <Row label="Subtotal (excl. GST)" value={formatPrice(totals.subtotalInPaise)} />
      {totals.savingsInPaise > 0 ? (
        <Row
          label="You save against retail"
          value={`−${formatPrice(totals.savingsInPaise)}`}
          tone="success"
        />
      ) : null}
      <Row
        label="Delivery (excl. GST)"
        value={totals.deliveryInPaise ? formatPrice(totals.deliveryInPaise) : "Free"}
      />
      <Row label="GST" value={formatPrice(totals.gstInPaise)} />
      <View className="flex-row items-baseline justify-between border-t border-gray-200 pt-1.5">
        <Text weight="semibold">Total (incl. GST)</Text>
        <Text variant="heading" tabular>
          {formatPrice(totals.totalInPaise)}
        </Text>
      </View>
      {rule && totals.deliveryInPaise > 0 ? (
        <Text variant="small" tone="muted">
          Delivery is free from {formatPrice(rule.freeFromExclGstInPaise)} excl. GST. Add{" "}
          {formatPrice(rule.freeFromExclGstInPaise - totals.subtotalInPaise)} more.
        </Text>
      ) : null}
    </View>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <View className="flex-row justify-between">
      <Text variant="small" tone={tone ?? "muted"}>
        {label}
      </Text>
      <Text variant="small" weight="semibold" tone={tone ?? "default"} tabular>
        {value}
      </Text>
    </View>
  );
}
