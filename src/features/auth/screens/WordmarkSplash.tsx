import { ActivityIndicator, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { APP_NAME } from "@/lib/constants";
import { colors } from "@/lib/theme";

/** G01: the wordmark (text until the logo arrives) while the app checks who is signed in. */
export function WordmarkSplash() {
  return (
    <View
      accessible
      accessibilityLabel={`${APP_NAME}, loading`}
      className="flex-1 items-center justify-center gap-6 bg-navy-900"
    >
      <View className="items-center gap-1">
        <Text variant="title" tone="inverse" weight="bold">
          {APP_NAME}
        </Text>
        <Text tone="inverseMuted">by Kannali Garage</Text>
      </View>
      <ActivityIndicator color={colors.white} />
    </View>
  );
}
