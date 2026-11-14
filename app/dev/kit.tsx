import { Redirect } from "expo-router";

import { KitScreen } from "@/features/dev-kit/screens/KitScreen";

/** Developer-only: never reachable in a release build. */
export default function KitRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <KitScreen />;
}
