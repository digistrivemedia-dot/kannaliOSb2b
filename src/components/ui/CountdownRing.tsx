import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { Text } from "@/components/ui/Text";
import { formatCountdown } from "@/lib/format";
import { colors } from "@/lib/theme";
import { useNow } from "@/lib/use-now";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** The last minute turns red, so an answer about to be missed stands out. */
const URGENT_MS = 60_000;

const SIZES = {
  small: { diameter: 56, stroke: 5, text: "label" },
  large: { diameter: 168, stroke: 10, text: "figure" },
} as const;

type CountdownRingProps = {
  /** When time runs out (ISO). */
  deadline: string;
  /** The whole time allowed, so the ring starts full. */
  totalMs: number;
  size?: keyof typeof SIZES;
};

/** Time left to answer a new booking, as a ring that empties and a "1:32" in the middle. */
export function CountdownRing({ deadline, totalMs, size = "small" }: CountdownRingProps) {
  const now = useNow(1000);
  const { diameter, stroke, text } = SIZES[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const deadlineMs = Date.parse(deadline);
  const leftMs = Math.max(0, deadlineMs - now.getTime());
  const isUrgent = leftMs <= URGENT_MS;

  // The ring runs smoothly on the UI thread; the figure updates once a second.
  const progress = useSharedValue(Math.min(1, leftMs / totalMs));
  useEffect(() => {
    const remaining = Math.max(0, deadlineMs - Date.now());
    progress.value = Math.min(1, remaining / totalMs);
    progress.value = withTiming(0, { duration: remaining, easing: Easing.linear });
  }, [deadlineMs, totalMs, progress]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const seconds = Math.ceil(leftMs / 1000);
  const spoken =
    seconds >= 60
      ? `${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds left to answer`
      : `${seconds} seconds left to answer`;

  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={leftMs > 0 ? spoken : "Time to answer is up"}
      style={{ width: diameter, height: diameter }}
      className="items-center justify-center"
    >
      <Svg width={diameter} height={diameter} style={{ position: "absolute" }}>
        <Circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={colors.gray[200]}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={isUrgent ? colors.danger[600] : colors.orange[700]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="none"
          // Starts at 12 o'clock and empties clockwise.
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
        />
      </Svg>
      <Text variant={text} weight="semibold" tabular tone={isUrgent ? "danger" : "default"}>
        {formatCountdown(leftMs)}
      </Text>
    </View>
  );
}
