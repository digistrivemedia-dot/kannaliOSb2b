import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";

type DetailRowProps = {
  label: string;
  /** Text, or anything richer such as a badge. */
  children: ReactNode;
};

/** A label above its value, for the facts on a detail screen. */
export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <View className="gap-0.5">
      <Text variant="small" tone="muted">
        {label}
      </Text>
      {typeof children === "string" || typeof children === "number" ? (
        <Text>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
