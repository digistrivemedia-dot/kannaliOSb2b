import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";

type HeaderProps = {
  title: string;
  subtitle?: string;
  /** Icon buttons on the right, such as the "⋯" menu. */
  actions?: ReactNode;
  /** Left out on screens you can't go back from. */
  showBack?: boolean;
};

/** The white header of every screen that isn't a main tab: back, title, actions. */
export function Header({ title, subtitle, actions, showBack = true }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center gap-1 border-b border-gray-200 bg-white px-1 pb-1"
      style={{ paddingTop: insets.top + 4 }}
    >
      {showBack && router.canGoBack() ? (
        <IconButton icon={ArrowLeft} label="Back" onPress={() => router.back()} />
      ) : (
        <View className="w-3" />
      )}
      <View className="min-h-12 flex-1 justify-center">
        <Text variant="heading" numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? (
        <View className="flex-row items-center">{actions}</View>
      ) : (
        <View className="w-3" />
      )}
    </View>
  );
}
