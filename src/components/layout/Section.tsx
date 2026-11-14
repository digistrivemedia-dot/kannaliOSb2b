import { CircleCheck } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

type SectionProps = {
  title: string;
  children: ReactNode;
  /** A link on the right of the title, such as "See all". */
  action?: { label: string; onPress: () => void };
  /** Ticks the section once its part of the work is finished. */
  isDone?: boolean;
};

/** A titled block of a screen. Sections are 24 apart (the Screen's gap). */
export function Section({ title, children, action, isDone }: SectionProps) {
  return (
    <View className="gap-3">
      <View className="min-h-6 flex-row items-center gap-2">
        <Text variant="label" tone="muted" sectionLabel accessibilityRole="header" className="flex-1">
          {title}
        </Text>
        {isDone ? (
          <View accessible accessibilityLabel="Done" className="flex-row items-center gap-1">
            <CircleCheck size={18} color={colors.success[700]} />
            <Text variant="label" tone="success">
              Done
            </Text>
          </View>
        ) : null}
        {action ? (
          <Pressable
            onPress={action.onPress}
            accessibilityRole="link"
            hitSlop={12}
            className="min-h-12 justify-center"
          >
            <Text variant="small" weight="semibold" tone="navy">
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
