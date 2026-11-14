import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/store";
import { TAB_HREFS, tabsFor } from "@/features/auth/tabs";

/** Opens the signed-in user's first tab, or sign in. */
export default function Index() {
  const session = useAuth((state) => state.session);
  if (!session) return <Redirect href="/sign-in" />;
  const { tabs } = tabsFor(session.roles, session.business.type);
  return <Redirect href={TAB_HREFS[tabs[0] ?? "more"]} />;
}
