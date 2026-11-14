import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** How many items the chip leads to, e.g. jobs in a status. */
  count?: number;
};

/** A filter choice. Selected chips are navy. The 40-tall pill reaches 48 with its hit slop. */
export function Chip({ label, selected, onPress, count }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      className={cn(
        "h-10 flex-row items-center gap-2 rounded-full px-4",
        selected ? "bg-navy-800" : "border border-gray-300 bg-white active:bg-gray-100",
      )}
    >
      <Text variant="small" weight="medium" tone={selected ? "inverse" : "default"}>
        {label}
      </Text>
      {count !== undefined && (
        <View
          className={cn(
            "min-w-6 items-center rounded-full px-1.5",
            selected ? "bg-navy-600" : "bg-gray-100",
          )}
        >
          <Text variant="label" weight="semibold" tone={selected ? "inverse" : "default"} tabular>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
