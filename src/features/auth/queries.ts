import { useQuery } from "@tanstack/react-query";

import * as authApi from "@/features/auth/api";
import { getSavedApplication, type SavedApplication } from "@/features/auth/application-store";

export const authKeys = {
  savedApplication: ["application", "saved"] as const,
  application: (ref: string) => ["application", ref] as const,
};

/** The application this phone sent, if any (reference and access key). */
export function useSavedApplication() {
  return useQuery({ queryKey: authKeys.savedApplication, queryFn: getSavedApplication });
}

export function useApplication(saved: SavedApplication | null | undefined) {
  return useQuery({
    queryKey: authKeys.application(saved?.ref ?? ""),
    queryFn: () => (saved ? authApi.getApplication(saved.ref, saved.key) : null),
    enabled: Boolean(saved),
  });
}
