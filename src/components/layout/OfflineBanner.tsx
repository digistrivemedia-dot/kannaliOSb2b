import { useNetworkState } from "expo-network";
import { WifiOff } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

/** A slim banner while the phone is offline; lists keep what they showed and refetch when it's back. */
export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const isOffline = isConnected === false || isInternetReachable === false;
  if (!isOffline) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="flex-row items-center justify-center gap-2 bg-gray-900 px-4 py-2"
    >
      <WifiOff size={16} color={colors.white} />
      <Text variant="small" weight="medium" tone="inverse">
        No connection, retrying
      </Text>
    </View>
  );
}
