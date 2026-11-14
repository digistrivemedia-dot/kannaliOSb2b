import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { EMPTY_REGISTRATION, type RegisterValues } from "@/features/auth/schemas";

/** "new": a first application · "resubmit": correcting a sent-back one · "reapply": after a rejection. */
export type RegisterMode = "new" | "resubmit" | "reapply";

type RegisterDraft = {
  values: RegisterValues;
  step: number;
  mode: RegisterMode;
  /** The application being corrected (resubmit only). */
  ref: string | null;
  save: (values: RegisterValues, step: number) => void;
  /** Starts the wizard: empty, or filled in from an earlier application. */
  start: (draft: { values: RegisterValues; mode: RegisterMode; ref: string | null }) => void;
  clear: () => void;
};

/** The application being filled in, kept on the phone so closing the app never loses it. */
export const useRegisterDraft = create<RegisterDraft>()(
  persist(
    (set) => ({
      values: EMPTY_REGISTRATION,
      step: 0,
      mode: "new",
      ref: null,
      save: (values, step) => set({ values, step }),
      start: ({ values, mode, ref }) => set({ values, mode, ref, step: 0 }),
      clear: () => set({ values: EMPTY_REGISTRATION, step: 0, mode: "new", ref: null }),
    }),
    { name: "register-draft", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
