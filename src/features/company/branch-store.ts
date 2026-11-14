import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { onSignOut } from "@/features/auth/store";

type BranchState = {
  /** The branch an owner chose in the branch switcher; null until they choose one. */
  branchId: string | null;
  setBranchId: (branchId: string) => void;
};

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      branchId: null,
      setBranchId: (branchId) => set({ branchId }),
    }),
    { name: "selected-branch", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

onSignOut(() => useBranchStore.setState({ branchId: null }));
