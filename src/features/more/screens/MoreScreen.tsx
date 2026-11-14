import { router } from "expo-router";
import { LogOut, Palette } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { ComingSoon } from "@/components/layout/ComingSoon";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Text } from "@/components/ui/Text";
import { describeRoles } from "@/features/auth/roles";
import { useAuth, useSession } from "@/features/auth/store";
import { tabLabel } from "@/features/auth/tabs";
import { useActiveBranch } from "@/features/company/use-active-branch";

/**
 * G75, for Phase 1: who is signed in, and Sign out. The grouped menu of everything else this user
 * may open is built in Phase 8.
 */
export function MoreScreen() {
  const { user, roles, business } = useSession();
  const branch = useActiveBranch();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isGarage = business.type === "garage";

  const signOut = async () => {
    setIsSigningOut(true);
    await useAuth.getState().signOut();
  };

  return (
    <Screen inTabs header={<TopBar title={tabLabel("more", business.type)} />}>
      <Card className="flex-row items-center gap-3">
        <Avatar name={user.name} />
        <View className="flex-1">
          <Text weight="semibold">{user.name}</Text>
          <Text variant="small" tone="muted">
            {user.email}
          </Text>
          <Text variant="small" tone="muted">
            {isGarage ? `${describeRoles(roles)} · ${branch.name}` : business.name}
          </Text>
        </View>
      </Card>
      <ComingSoon screen="G75" />
      <Section title="Account">
        <Card flush>
          {__DEV__ && (
            <ListRow
              title="Design kit"
              subtitle="Every component, for developers"
              icon={Palette}
              onPress={() => router.push("/dev/kit")}
            />
          )}
          <ListRow
            title={isSigningOut ? "Signing out…" : "Sign out"}
            icon={LogOut}
            destructive
            divided={__DEV__}
            onPress={isSigningOut ? undefined : () => void signOut()}
          />
        </Card>
      </Section>
    </Screen>
  );
}
