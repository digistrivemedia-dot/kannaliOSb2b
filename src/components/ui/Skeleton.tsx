import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

/**
 * A pulsing gray block in the shape of the content to come. Size it with className
 * ("h-5 w-32"); screens put the label "Loading" on the group, not on each block.
 */
export function Skeleton({
  className,
  shape = "block",
}: {
  className?: string;
  shape?: "block" | "card";
}) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.45, { duration: 800 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      className={cn(
        "overflow-hidden",
        shape === "card" ? "rounded-card" : "rounded-plate",
        className,
      )}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.gray[200] }, style]}
      />
    </View>
  );
}
