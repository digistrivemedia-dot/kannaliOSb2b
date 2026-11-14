import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import type { FuelLevel } from "@/features/jobs/types";
import { FUEL_LEVEL_LABELS } from "@/features/jobs/utils";
import { FUEL_LEVELS } from "@/features/jobs/schemas";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

/** Fuel level in five big steps, filled up to the one chosen, like a fuel gauge. */
export function FuelLevelPicker({
  value,
  onChange,
}: {
  value: FuelLevel;
  onChange: (level: FuelLevel) => void;
}) {
  const chosen = FUEL_LEVELS.indexOf(value);
  return (
    <View className="gap-1.5">
      <Text variant="label">Fuel level</Text>
      <View accessibilityRole="radiogroup" className="flex-row gap-1.5">
        {FUEL_LEVELS.map((level, index) => (
          <Pressable
            key={level}
            accessibilityRole="radio"
            accessibilityState={{ selected: level === value }}
            accessibilityLabel={`Fuel ${FUEL_LEVEL_LABELS[level]}`}
            onPress={() => {
              haptic.select();
              onChange(level);
            }}
            className={cn(
              "h-14 flex-1 items-center justify-center rounded-button border-2",
              index <= chosen ? "border-navy-800 bg-navy-800" : "border-gray-300 bg-white",
            )}
          >
            <Text weight="semibold" tone={index <= chosen ? "inverse" : "default"}>
              {FUEL_LEVEL_LABELS[level]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
