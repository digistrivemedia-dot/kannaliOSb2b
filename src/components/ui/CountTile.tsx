import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";

type CountTileProps = {
  label: string;
  /** A count, or an amount already formatted ("₹13,081"). */
  count: number | string;
  /** Opens the list behind the number; without it the tile is a plain figure (reports). */
  onPress?: () => void;
  /** Draws attention when there is something waiting, such as new bookings. */
  urgent?: boolean;
  /** Shown while the count loads. */
  loading?: boolean;
};

/** A big figure that opens the filtered list behind it. Use two to a row. */
export function CountTile({ label, count, onPress, urgent, loading }: CountTileProps) {
  const isUrgent = urgent && typeof count === "number" && count > 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={loading ? `${label}, loading` : `${label}: ${count}`}
      className={cn(
        "min-h-28 flex-1 justify-between gap-2 rounded-card border p-4",
        isUrgent
          ? "border-orange-700 bg-orange-50 active:bg-orange-100"
          : cn("border-gray-200 bg-white", onPress ? "active:bg-gray-50" : null),
      )}
    >
      {loading ? (
        <View className="h-9 w-12 rounded-plate bg-gray-200" />
      ) : (
        <Text
          variant="figure"
          tone={isUrgent ? "action" : "default"}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {count}
        </Text>
      )}
      <Text variant="small" weight="medium" tone={isUrgent ? "action" : "muted"} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
