import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { APP_NAME } from "@/lib/constants";

/** The navy top of the sign-in screens: the wordmark (text until the logo arrives) and a title. */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="gap-6 bg-navy-900 px-4 pb-6" style={{ paddingTop: insets.top + 24 }}>
      <Text variant="heading" tone="inverse" weight="bold" accessibilityRole="header">
        {APP_NAME}
      </Text>
      <View className="gap-1">
        <Text variant="title" tone="inverse">
          {title}
        </Text>
        <Text tone="inverseMuted">{subtitle}</Text>
      </View>
    </View>
  );
}
