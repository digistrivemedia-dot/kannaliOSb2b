import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useScreenContext } from "@/components/layout/Screen";

/** The bar at the bottom of a screen that holds its main action (56 tall, full width). */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { inTabs } = useScreenContext();
  return (
    <View
      className="gap-2 border-t border-gray-200 bg-white px-4 pt-3"
      style={{ paddingBottom: inTabs ? 12 : Math.max(insets.bottom, 12) }}
    >
      {children}
    </View>
  );
}
