import { CloudOff, TriangleAlert } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { ApiError, errorMessage } from "@/lib/api-client";
import { colors } from "@/lib/theme";

type ErrorStateProps = {
  error: unknown;
  onRetry: () => void;
  /** Shown while the retry runs. */
  retrying?: boolean;
  /** What failed to load, e.g. "this job card". */
  what?: string;
};

/** What went wrong in plain words, and Try again. */
export function ErrorState({ error, onRetry, retrying, what = "this" }: ErrorStateProps) {
  const isOffline = error instanceof ApiError && error.code === "network";
  const Icon = isOffline ? CloudOff : TriangleAlert;
  return (
    <View accessibilityLiveRegion="polite" className="items-center gap-3 px-6 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-danger-50">
        <Icon size={30} color={colors.danger[700]} />
      </View>
      <Text variant="heading" className="text-center">
        {isOffline ? "No connection" : `Couldn't load ${what}`}
      </Text>
      <Text tone="muted" className="text-center">
        {errorMessage(error)}
      </Text>
      <Button label="Try again" onPress={onRetry} loading={retrying} variant="secondary" className="mt-2" />
    </View>
  );
}
