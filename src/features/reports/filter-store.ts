import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { onSignOut } from "@/features/auth/store";

export type ReportRange = "today" | "week" | "month" | "this_month" | "last_month" | "custom";

type ReportChoice = {
  /** Every branch when null. */
  branchId: string | null;
  range: ReportRange;
  /** "YYYY-MM-DD", only for a custom range. */
  from: string | null;
  to: string | null;
};

type ReportFilterStore = ReportChoice & { set: (choice: ReportChoice) => void };

const DEFAULTS: ReportChoice = { branchId: null, range: "month", from: null, to: null };

/** The report's last-used branch and dates, kept on the phone (CLAUDE.md §4). */
export const useReportFilters = create<ReportFilterStore>()(
  persist((set) => ({ ...DEFAULTS, set: (choice) => set(choice) }), {
    name: "report-filters",
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

onSignOut(() => useReportFilters.setState(DEFAULTS));
