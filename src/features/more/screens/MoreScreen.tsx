import { router } from "expo-router";
import { Bell, LogOut, Palette, UserRound } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Text } from "@/components/ui/Text";
import { describeRoles } from "@/features/auth/roles";
import { useAuth, useSession } from "@/features/auth/store";
import { tabLabel, tabsFor } from "@/features/auth/tabs";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { moreMenu } from "@/features/more/menu";

/** G75: everything else this user may open, grouped (Garage, Buying, Money, Company), then their account. */
export function MoreScreen() {
  const session = useSession();
  const { user, roles, business } = session;
  const branch = useActiveBranch();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isGarage = business.type === "garage";
  const groups = moreMenu(session, tabsFor(roles, business.type).tabs);

  const signOut = async () => {
    setIsSigningOut(true);
    await useAuth.getState().signOut();
  };

  return (
    <Screen inTabs header={<TopBar title={tabLabel("more", business.type)} />}>
      <Card
        onPress={() => router.push("/account")}
        accessibilityLabel="My account"
        className="flex-row items-center gap-3"
      >
        <Avatar name={user.name} />
        <View className="flex-1">
          <Text weight="semibold">{user.name}</Text>
          <Text variant="small" tone="muted">
            {isGarage ? `${describeRoles(roles)} · ${branch.name}` : business.name}
          </Text>
        </View>
      </Card>
      {groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <Card flush>
            {group.items.map((item, index) => (
              <ListRow
                key={item.label}
                icon={item.icon}
                title={item.label}
                onPress={() => router.push(item.href)}
                divided={index > 0}
              />
            ))}
          </Card>
        </Section>
      ))}
      <Section title="Account">
        <Card flush>
          <ListRow
            icon={UserRound}
            title="My account"
            subtitle="Your details and password"
            onPress={() => router.push("/account")}
          />
          <ListRow
            icon={Bell}
            title="Notifications"
            onPress={() => router.push("/notifications")}
            divided
          />
          {__DEV__ && (
            <ListRow
              icon={Palette}
              title="Design kit"
              subtitle="Every component, for developers"
              onPress={() => router.push("/dev/kit")}
              divided
            />
          )}
          <ListRow
            title={isSigningOut ? "Signing out…" : "Sign out"}
            icon={LogOut}
            destructive
            divided
            onPress={isSigningOut ? undefined : () => void signOut()}
          />
        </Card>
      </Section>
    </Screen>
  );
}
