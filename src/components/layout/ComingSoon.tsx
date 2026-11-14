import { Hammer } from "lucide-react-native";

import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Screens that later phases build (APP-SCREENS.md). Links to them open this placeholder until then;
 * each phase removes its screens from here, and Phase 9 deletes the file.
 */
export const PLANNED_SCREENS = {
  G35: { name: "Inspection", phase: 5 },
  G36: { name: "Estimate", phase: 5 },
  G37: { name: "Record customer's answer", phase: 5 },
  G38: { name: "Extra work", phase: 5 },
  G39: { name: "Quality check", phase: 5 },
  G40: { name: "My jobs", phase: 5 },
  G42: { name: "Bill", phase: 6 },
  G43: { name: "Collect payment", phase: 6 },
  G44: { name: "Handover", phase: 6 },
  G45: { name: "Completion report", phase: 6 },
  G46: { name: "Trips", phase: 6 },
  G47: { name: "Assign driver", phase: 6 },
  G50: { name: "Shop", phase: 7 },
  G57: { name: "Orders", phase: 7 },
  G75: { name: "More", phase: 8 },
  G83: { name: "Customer and vehicle history", phase: 9 },
  G86: { name: "Notifications", phase: 9 },
  /** The non-garage Home tab (G-Q07). */
  HOME: { name: "Home", phase: 7 },
} as const;

export type PlannedScreen = keyof typeof PLANNED_SCREENS;

/** The link to a screen a later phase builds. */
export function plannedHref(screen: PlannedScreen) {
  return { pathname: "/coming-soon", params: { screen } } as const;
}

export function isPlannedScreen(value: string | null): value is PlannedScreen {
  return value !== null && value in PLANNED_SCREENS;
}

/** What the placeholder says: which screen comes, and in which phase. */
export function ComingSoon({ screen }: { screen: PlannedScreen }) {
  const { name, phase } = PLANNED_SCREENS[screen];
  return (
    <EmptyState
      icon={Hammer}
      title={`${name} comes next`}
      message={`This screen (${screen === "HOME" ? "Home" : screen}) is built in phase ${phase}.`}
    />
  );
}
