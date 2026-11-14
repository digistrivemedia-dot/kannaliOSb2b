import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { formatPlate } from "@/lib/format";

const SIZES = {
  regular: { box: "h-8 pr-2.5", strip: "w-1.5", text: { fontSize: 16, lineHeight: 20 } },
  large: { box: "h-12 pr-4", strip: "w-2.5", text: { fontSize: 24, lineHeight: 30 } },
} as const;

type PlateChipProps = {
  plate: string;
  size?: keyof typeof SIZES;
};

/**
 * The number plate as a plate: white, a dark border, bold even-width digits and the navy strip of an
 * Indian plate. It leads every job, booking and trip.
 */
export function PlateChip({ plate, size = "regular" }: PlateChipProps) {
  const style = SIZES[size];
  const text = formatPlate(plate);
  return (
    <View
      accessible
      accessibilityLabel={`Number plate ${text.split("").join(" ")}`}
      className={cn(
        "flex-row items-center gap-2 self-start overflow-hidden rounded-plate border-2 border-gray-900 bg-white",
        style.box,
      )}
    >
      <View className={cn("self-stretch bg-navy-700", style.strip)} />
      <Text
        weight="bold"
        tabular
        numberOfLines={1}
        maxFontSizeMultiplier={1.4}
        style={[style.text, { letterSpacing: 1 }]}
      >
        {text}
      </Text>
    </View>
  );
}
