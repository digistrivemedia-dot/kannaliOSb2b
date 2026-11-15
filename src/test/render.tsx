import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastHost } from "@/components/ui/Toast";

import { useAuth } from "@/features/auth/store";
import type { Session } from "@/features/auth/types";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Renders a screen as the app does: query cache, safe area, and (optionally) a signed-in session. */
export async function renderScreen(ui: ReactElement, { session }: { session?: Session } = {}) {
  if (session) useAuth.setState({ session });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  return await render(
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={METRICS}>
        {ui}
        <ToastHost />
      </SafeAreaProvider>
    </QueryClientProvider>,
  );
}
