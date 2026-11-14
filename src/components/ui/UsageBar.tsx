import { View } from "react-native";

import { toneColors } from "@/lib/theme";

type UsageBarProps = {
  used: number;
  limit: number;
  /** Read out with the share used, e.g. "Credit used". */
  label: string;
};

/** How much of a limit is used: navy while there is room, amber past 80%, red when full. */
export function UsageBar({ used, limit, label }: UsageBarProps) {
  const share = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 0;
  const tone = share >= 1 ? "danger" : share >= 0.8 ? "warning" : "info";
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(share * 100) }}
      className="h-3 overflow-hidden rounded-full bg-gray-200"
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${share * 100}%`, backgroundColor: toneColors[tone].strong }}
      />
    </View>
  );
}
