import { ComingSoon, isPlannedScreen, PLANNED_SCREENS } from "@/components/layout/ComingSoon";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { useSafeParam } from "@/lib/params";

/** Where links to not-yet-built screens lead (removed in Phase 9). */
export default function ComingSoonRoute() {
  const screen = useSafeParam("screen");
  const known = isPlannedScreen(screen) ? screen : null;
  return (
    <Screen header={<Header title={known ? PLANNED_SCREENS[known].name : "Coming soon"} />}>
      {known ? <ComingSoon screen={known} /> : null}
    </Screen>
  );
}
