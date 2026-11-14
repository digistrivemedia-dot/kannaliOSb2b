import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState } from "react-native";

import { ApiError } from "@/lib/api-client";

/** Requests the user can't fix by trying again (bad input, no access, not found) aren't retried. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 3;
}

function retryWhenOffline(failureCount: number, error: unknown): boolean {
  return error instanceof ApiError && error.code === "network" && failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: shouldRetry },
    // A save that couldn't reach the server (no connection) is sent again on its own, twice. If the
    // first one did arrive, the server refuses the repeat (the job has already moved on).
    mutations: { retry: retryWhenOffline, retryDelay: 2000 },
  },
});

// Queries pause while the phone is offline and refetch when it's back.
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) =>
    setOnline(state.isConnected !== false),
  );
  return () => subscription.remove();
});

// "Window focus" on a phone is the app coming back to the foreground.
focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener("change", (status) =>
    setFocused(status === "active"),
  );
  return () => subscription.remove();
});
