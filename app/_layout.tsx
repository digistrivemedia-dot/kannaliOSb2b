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
import { WordmarkSplash } from "@/features/auth/screens/WordmarkSplash";
import { useRegisterDraft } from "@/features/auth/register-draft-store";
import { useAuth } from "@/features/auth/store";
import { useCart } from "@/features/cart/store";
import { useBranchStore } from "@/features/company/branch-store";
import { useDraftStore } from "@/lib/drafts";
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

/** The stores kept on the phone, read back before the first screen shows. */
const SAVED_STORES = [useBranchStore, useRegisterDraft, useDraftStore, useCart];

function useSavedChoicesLoaded() {
  const allLoaded = () => SAVED_STORES.every((store) => store.persist.hasHydrated());
  const [isLoaded, setIsLoaded] = useState(allLoaded);
  useEffect(() => {
    const stops = SAVED_STORES.map((store) =>
      store.persist.onFinishHydration(() => setIsLoaded(allLoaded())),
    );
    return () => stops.forEach((stop) => stop());
  }, []);
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
  const fontsReady = fontsLoaded || fontError !== null;
  const isReady = fontsReady && status !== "restoring" && savedChoicesLoaded;

  // The native splash gives way to the wordmark (G01) as soon as the fonts are in.
  useEffect(() => {
    if (fontsReady) void SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;
  if (!isReady) return <WordmarkSplash />;

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
              <Stack.Screen name="job/[id]/index" />
              <Stack.Screen name="job/[id]/check-in" />
              <Stack.Screen name="job/[id]/assign-technician" options={sheet} />
              <Stack.Screen name="job/[id]/inspection" />
              <Stack.Screen name="job/[id]/estimate" />
              <Stack.Screen name="job/[id]/answer" />
              <Stack.Screen name="job/[id]/extra-work" />
              <Stack.Screen name="job/[id]/quality-check" />
              <Stack.Screen name="my-job/[id]/index" />
              <Stack.Screen
                name="my-job/[id]/decline"
                options={{ ...sheet, sheetAllowedDetents: [0.7, 1] }}
              />
              <Stack.Screen name="part-search" options={{ ...sheet, sheetAllowedDetents: [0.9] }} />
              <Stack.Screen name="job/[id]/bill" />
              <Stack.Screen
                name="job/[id]/collect-payment"
                options={{ ...sheet, sheetAllowedDetents: [0.8, 1] }}
              />
              <Stack.Screen name="job/[id]/handover" />
              <Stack.Screen name="job/[id]/report" />
              <Stack.Screen name="job/[id]/assign-driver" options={sheet} />
              <Stack.Screen name="walk-in" />
              <Stack.Screen name="products" />
              <Stack.Screen
                name="products-filters"
                options={{ ...sheet, sheetAllowedDetents: [0.9] }}
              />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="quick-order" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="order-placed/[id]" options={{ gestureEnabled: false }} />
              <Stack.Screen name="order/[id]/index" />
              <Stack.Screen
                name="order/[id]/cancel"
                options={{ ...sheet, sheetAllowedDetents: [0.8, 1] }}
              />
              <Stack.Screen name="order/[id]/return" />
              <Stack.Screen name="returns" />
              <Stack.Screen name="return/[id]" />
              <Stack.Screen name="quotations" />
              <Stack.Screen name="quotation/new" />
              <Stack.Screen name="quotation/[id]/index" />
              <Stack.Screen name="quotation/[id]/answer" options={sheet} />
              <Stack.Screen
                name="jobs-filters"
                options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }}
              />
              <Stack.Screen name="booking/[id]/index" />
              <Stack.Screen
                name="booking/[id]/decline"
                options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }}
              />
              <Stack.Screen
                name="booking-alert/[id]"
                options={{
                  presentation: "fullScreenModal",
                  statusBarStyle: "light",
                  animation: "fade",
                }}
              />
              <Stack.Screen name="credit" />
              <Stack.Screen name="pay-dues" options={{ ...sheet, sheetAllowedDetents: [0.8, 1] }} />
              <Stack.Screen name="payments" />
              <Stack.Screen name="payment/[id]" />
              <Stack.Screen name="documents" />
              <Stack.Screen name="business-profile" />
              <Stack.Screen name="addresses" />
              <Stack.Screen name="address/new" />
              <Stack.Screen name="address/[id]" />
              <Stack.Screen name="team" />
              <Stack.Screen name="person/new" />
              <Stack.Screen name="person/[id]" />
              <Stack.Screen name="branches" />
              <Stack.Screen name="garage-profile" />
              <Stack.Screen name="coming-soon" />
              <Stack.Screen name="sheets/select" options={sheet} />
              <Stack.Screen name="branch-switcher" options={sheet} />
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
