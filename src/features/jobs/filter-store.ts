import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { onSignOut } from "@/features/auth/store";

/** "Any time", or how far back the job was opened. */
export type JobDateRange = "any" | "today" | "week" | "month";

type JobFilters = {
  technicianId: string | null;
  dateRange: JobDateRange;
  set: (filters: { technicianId: string | null; dateRange: JobDateRange }) => void;
};

/** The job list's last-used filters (technician, date), kept on the phone (CLAUDE.md §4). */
export const useJobFilters = create<JobFilters>()(
  persist(
    (set) => ({
      technicianId: null,
      dateRange: "any",
      set: (filters) => set(filters),
    }),
    { name: "job-filters", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

onSignOut(() => useJobFilters.setState({ technicianId: null, dateRange: "any" }));

export const DATE_RANGE_LABELS: Record<JobDateRange, string> = {
  any: "Any time",
  today: "Opened today",
  week: "Last 7 days",
  month: "Last 30 days",
};

/** The first day (India time, "YYYY-MM-DD") a date range starts on. */
export function rangeStart(range: JobDateRange, today: string): string | undefined {
  if (range === "any") return undefined;
  const days = range === "today" ? 0 : range === "week" ? 6 : 29;
  const start = new Date(`${today}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString().slice(0, 10);
}
