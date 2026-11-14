import { ComingSoon, type PlannedScreen } from "@/components/layout/ComingSoon";
import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";

/** A main tab whose screen a later phase builds. */
export function PlannedTab({ title, screen }: { title: string; screen: PlannedScreen }) {
  return (
    <Screen inTabs header={<TopBar title={title} />}>
      <ComingSoon screen={screen} />
    </Screen>
  );
}
