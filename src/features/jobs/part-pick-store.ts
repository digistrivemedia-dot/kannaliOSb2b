import { create } from "zustand";

import type { PartMatch } from "@/features/jobs/types";

type PartPick = {
  onPick: (part: PartMatch) => void;
  /** Hands the line's callback to the part search sheet (`app/part-search.tsx`), which opens next. */
  open: (onPick: (part: PartMatch) => void) => void;
};

/** Which estimate line the part search fills. One search is open at a time. */
export const usePartPick = create<PartPick>((set) => ({
  onPick: () => {},
  open: (onPick) => set({ onPick }),
}));
