import "../global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ToastHost } from "@/components/ui/Toast";
import { UnreachableScreen } from "@/features/auth/screens/UnreachableScreen";
import { useAuth } from "@/features/auth/store";
import { useBranchStore } from "@/features/company/branch-store";
import { queryClient } from "@/lib/query-client";
import { colors, radius } from "@/lib/theme";

void SplashScreen.preventAutoHideAsync();

/** Small choices open as native form sheets (CLAUDE.md §6). */
const sheet = {
  presentation: "formSheet" as const,
  sheetGrabberVisible: true,
  sheetCornerRadius: radius.sheet,
  sheetAllowedDetents: [0.6, 1],
  contentStyle: { backgroundColor: colors.white },
};

/** True once the choices kept on the phone (the selected branch) are read back. */
function useSavedChoicesLoaded() {
  const [isLoaded, setIsLoaded] = useState(() => useBranchStore.persist.hasHydrated());
  useEffect(() => useBranchStore.persist.onFinishHydration(() => setIsLoaded(true)), []);
  return isLoaded;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const status = useAuth((state) => state.status);
  const savedChoicesLoaded = useSavedChoicesLoaded();

  useEffect(() => {
    void useAuth.getState().restore();
  }, []);

  // A font that fails to load falls back to the system font rather than blocking the app.
  const isReady = (fontsLoaded || fontError !== null) && status !== "restoring" && savedChoicesLoaded;

  useEffect(() => {
    if (isReady) void SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  const isSignedIn = status === "signed_in";
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {status === "unreachable" ? (
          <UnreachableScreen />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              statusBarStyle: "dark",
              contentStyle: { backgroundColor: colors.gray[50] },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Protected guard={isSignedIn}>
              <Stack.Screen name="(tabs)" options={{ statusBarStyle: "light" }} />
              <Stack.Screen name="job/[id]" />
              <Stack.Screen name="coming-soon" />
              <Stack.Screen name="sheets/select" options={sheet} />
              <Stack.Screen name="dev/kit" />
            </Stack.Protected>
            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="(auth)" options={{ statusBarStyle: "light" }} />
            </Stack.Protected>
          </Stack>
        )}
        <ToastHost />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
