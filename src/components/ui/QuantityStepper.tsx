import { Minus, Plus } from "lucide-react-native";
import { View } from "react-native";

import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";
import { haptic } from "@/lib/haptics";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** What is counted, read out with the number: "Quantity". */
  label?: string;
};

/** − 3 + with 48 targets; screen readers swipe up and down to change it. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  label = "Quantity",
}: QuantityStepperProps) {
  const change = (next: number) => {
    if (next < min || next > max) return;
    haptic.select();
    onChange(next);
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(event) =>
        change(event.nativeEvent.actionName === "increment" ? value + 1 : value - 1)
      }
      className="flex-row items-center self-start rounded-button border border-gray-300 bg-white"
    >
      <IconButton
        icon={Minus}
        label={`One less ${label.toLowerCase()}`}
        onPress={() => change(value - 1)}
        disabled={value <= min}
      />
      <Text variant="heading" tabular className="min-w-10 text-center">
        {value}
      </Text>
      <IconButton
        icon={Plus}
        label={`One more ${label.toLowerCase()}`}
        onPress={() => change(value + 1)}
        disabled={value >= max}
      />
    </View>
  );
}
