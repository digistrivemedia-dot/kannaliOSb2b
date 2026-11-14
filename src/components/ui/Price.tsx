import { View } from "react-native";

import { Text, type TextVariant } from "@/components/ui/Text";
import { formatPrice } from "@/lib/format";

type PriceProps = {
  paise: number;
  /** Every amount says whether GST is in it (CLAUDE.md §6). */
  gst: "excl" | "incl";
  size?: Extract<TextVariant, "figure" | "title" | "heading" | "body">;
};

/** An amount with its GST label: "₹1,250 excl. GST". */
export function Price({ paise, gst, size = "body" }: PriceProps) {
  const label = gst === "excl" ? "excl. GST" : "incl. GST";
  return (
    <View
      accessible
      accessibilityLabel={`${formatPrice(paise)} ${label}`}
      className="flex-row items-baseline gap-1.5"
    >
      <Text variant={size} weight="semibold" tabular>
        {formatPrice(paise)}
      </Text>
      <Text variant="label" tone="muted">
        {label}
      </Text>
    </View>
  );
}
