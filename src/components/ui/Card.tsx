import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  /** Makes the whole card one button; give it a label that says where it goes. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Leaves out the inner padding, for cards that hold rows edge to edge. */
  flush?: boolean;
  className?: string;
};

/** White, a gray-200 hairline and 14 corners. */
export function Card({ children, onPress, accessibilityLabel, flush, className }: CardProps) {
  const style = cn(
    "overflow-hidden rounded-card border border-gray-200 bg-white",
    !flush && "p-4",
    className,
  );
  if (!onPress) return <View className={style}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(style, "active:bg-gray-50")}
    >
      {children}
    </Pressable>
  );
}
