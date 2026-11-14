import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { toneColors, type Tone } from "@/lib/theme";

export type SegmentOption<T extends string> = { value: T; label: string; tone: Tone };

type SegmentedChoiceProps<T extends string> = {
  /** Read out with the choices, e.g. "Front brake". */
  label: string;
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

/**
 * Big side-by-side choices for the workshop floor: OK / Needs attention / Replace, Approve / Reject.
 * The chosen one fills with its status colour; its word says what it means.
 */
export function SegmentedChoice<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedChoiceProps<T>) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} className="flex-row gap-2">
      {options.map((option) => {
        const isChosen = option.value === value;
        const color = toneColors[option.tone];
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isChosen }}
            accessibilityLabel={`${label}: ${option.label}`}
            onPress={() => {
              haptic.select();
              onChange(option.value);
            }}
            className={cn(
              "min-h-14 flex-1 items-center justify-center rounded-button border-2 px-2",
              !isChosen && "border-gray-300 bg-white active:bg-gray-50",
            )}
            style={
              isChosen ? { backgroundColor: color.strong, borderColor: color.strong } : undefined
            }
          >
            <Text weight="semibold" tone={isChosen ? "inverse" : "default"} className="text-center">
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
