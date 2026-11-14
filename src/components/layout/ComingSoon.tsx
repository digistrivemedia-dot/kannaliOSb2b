import { Hammer } from "lucide-react-native";

import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Screens that later phases build (APP-SCREENS.md). Links to them open this placeholder until then;
 * each phase removes its screens from here, and Phase 9 deletes the file.
 */
export const PLANNED_SCREENS = {
  G70: { name: "Credit", phase: 8 },
  G75: { name: "More", phase: 8 },
  G83: { name: "Customer and vehicle history", phase: 9 },
  G86: { name: "Notifications", phase: 9 },
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
      message={`This screen (${screen}) is built in phase ${phase}.`}
    />
  );
}
