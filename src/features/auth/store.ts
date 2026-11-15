import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { create } from "zustand";

import * as authApi from "@/features/auth/api";
import type { Session } from "@/features/auth/types";
import { ApiError, setUnauthorizedHandler } from "@/lib/api-client";
import { useDraftStore } from "@/lib/drafts";
import { queryClient } from "@/lib/query-client";
import { clearToken, getToken, saveToken } from "@/lib/secure-token";

type AuthStatus =
  /** Reading the saved token and loading the session, behind the splash screen. */
  | "restoring"
  /** A token is saved but the backend couldn't be reached to load the session. */
  | "unreachable"
  | "signed_out"
  | "signed_in";

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  restore: () => Promise<void>;
  /** Saves a new session token and loads who it belongs to. */
  startSession: (token: string) => Promise<void>;
  /** `local` skips the backend call, for a session the backend has already ended (a 401). */
  signOut: (options?: { local?: boolean }) => Promise<void>;
};

/** Called by every store that keeps something on the phone, so signing out clears it from memory too. */
const resets = new Set<() => void>();

export function onSignOut(reset: () => void) {
  resets.add(reset);
}

export const useAuth = create<AuthState>((set, get) => ({
  status: "restoring",
  session: null,

  restore: async () => {
    set({ status: "restoring" });
    if (!(await getToken())) {
      set({ status: "signed_out", session: null });
      return;
    }
    try {
      set({ status: "signed_in", session: await authApi.getSession() });
    } catch (error) {
      // A 401 has already signed the user out; anything else means the backend is out of reach.
      if (!(error instanceof ApiError && error.status === 401)) set({ status: "unreachable" });
    }
  },

  startSession: async (token) => {
    await saveToken(token);
    const session = await authApi.getSession();
    set({ status: "signed_in", session });
  },

  signOut: async ({ local = false } = {}) => {
    if (get().status === "signed_out") return;
    if (!local) await authApi.signOut().catch(() => undefined);
    await clearToken();
    queryClient.clear();
    await AsyncStorage.clear();
    useDraftStore.getState().clearAll();
    resets.forEach((reset) => reset());
    set({ status: "signed_out", session: null });
  },
}));

setUnauthorizedHandler(() => void useAuth.getState().signOut({ local: true }));

/**
 * The signed-in session. Only for screens behind sign-in. While those screens animate away after
 * signing out, they keep the last session they had instead of breaking.
 */
export function useSession(): Session {
  const session = useAuth((state) => state.session);
  const [last, setLast] = useState(session);
  // Remembered during render (React's "information from previous renders" pattern), not in a ref.
  if (session && session !== last) setLast(session);
  const current = session ?? last;
  if (!current) throw new Error("useSession is used outside the signed-in screens.");
  return current;
}
