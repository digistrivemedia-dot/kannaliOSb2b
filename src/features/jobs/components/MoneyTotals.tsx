import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { formatPrice } from "@/lib/format";

type MoneyTotalsProps = {
  subtotalInPaise: number;
  gstInPaise: number;
  totalInPaise: number;
  /** "Approved", "Estimate"…: what the first line adds up. */
  subject?: string;
};

/** Excl. GST, GST on its own line, then the total incl. GST (CLAUDE.md §6). */
export function MoneyTotals({
  subtotalInPaise,
  gstInPaise,
  totalInPaise,
  subject = "Total",
}: MoneyTotalsProps) {
  return (
    <View className="gap-1.5">
      <Row label={`${subject} (excl. GST)`} value={formatPrice(subtotalInPaise)} />
      <Row label="GST" value={formatPrice(gstInPaise)} />
      <View className="flex-row items-baseline justify-between border-t border-gray-200 pt-1.5">
        <Text weight="semibold">Total (incl. GST)</Text>
        <Text variant="heading" tabular>
          {formatPrice(totalInPaise)}
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text variant="small" tone="muted">
        {label}
      </Text>
      <Text variant="small" weight="semibold" tabular>
        {value}
      </Text>
    </View>
  );
}
