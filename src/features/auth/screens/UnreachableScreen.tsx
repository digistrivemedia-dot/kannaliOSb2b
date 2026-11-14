import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { useAuth } from "@/features/auth/store";
import { ApiError } from "@/lib/api-client";

const NOT_REACHED = new ApiError(
  0,
  "network",
  "You're still signed in. Check your internet, or that the Kannali server is running, and try again.",
);

/** Signed in, but the session couldn't be loaded when the app opened. */
export function UnreachableScreen() {
  const [isRetrying, setIsRetrying] = useState(false);
  const retry = async () => {
    setIsRetrying(true);
    await useAuth.getState().restore();
    setIsRetrying(false);
  };
  return (
    <View className="flex-1 bg-gray-50">
      <AuthHeader
        title="Can't reach Kannali"
        subtitle="Your jobs will show as soon as you're back online."
      />
      <ErrorState error={NOT_REACHED} onRetry={() => void retry()} retrying={isRetrying} />
      <View className="items-center">
        <Button
          variant="ghost"
          label="Sign out"
          onPress={() => void useAuth.getState().signOut()}
        />
      </View>
    </View>
  );
}
