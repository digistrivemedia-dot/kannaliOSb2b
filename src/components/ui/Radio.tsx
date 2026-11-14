import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

type RadioProps = {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

/** One choice of several; wrap a group in a View with accessibilityRole="radiogroup". */
export function Radio({ label, description, selected, onSelect, disabled }: RadioProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onSelect();
      }}
      className={cn("min-h-12 flex-row items-center gap-3 py-2", disabled && "opacity-50")}
    >
      <View
        className={cn(
          "h-7 w-7 items-center justify-center rounded-full border-2",
          selected ? "border-navy-800" : "border-gray-500",
        )}
      >
        {selected && <View className="h-3.5 w-3.5 rounded-full bg-navy-800" />}
      </View>
      <View className="flex-1">
        <Text>{label}</Text>
        {description ? (
          <Text variant="small" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
