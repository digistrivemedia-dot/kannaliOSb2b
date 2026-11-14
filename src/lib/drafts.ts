import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DraftStore = {
  drafts: Record<string, unknown>;
  save: (key: string, values: unknown) => void;
  clear: (key: string) => void;
  clearAll: () => void;
};

/** Half-filled forms, by form and record, kept on the phone until they're sent (CLAUDE.md §6). */
export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      drafts: {},
      save: (key, values) => set((state) => ({ drafts: { ...state.drafts, [key]: values } })),
      clear: (key) =>
        set((state) => {
          const { [key]: _removed, ...rest } = state.drafts;
          return { drafts: rest };
        }),
      clearAll: () => set({ drafts: {} }),
    }),
    { name: "form-drafts", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** The saved draft for this form, if there is one: use it as the form's default values. */
export function savedDraft<T>(key: string): T | undefined {
  return useDraftStore.getState().drafts[key] as T | undefined;
}

/** Saves the form as it is typed; call `clearDraft(key)` once it has been sent. */
export function useFormDraft<T extends FieldValues>(key: string, form: UseFormReturn<T>) {
  const keyRef = useRef(key);
  keyRef.current = key;
  useEffect(() => {
    const subscription = form.watch((values) =>
      useDraftStore.getState().save(keyRef.current, values),
    );
    return () => subscription.unsubscribe();
  }, [form]);
}

export function clearDraft(key: string) {
  useDraftStore.getState().clear(key);
}
