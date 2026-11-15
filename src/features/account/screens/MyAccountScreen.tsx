import { useMutation } from "@tanstack/react-query";
import { KeyRound, LogOut } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { ListRow } from "@/components/ui/ListRow";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { requestPasswordReset } from "@/features/auth/api";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/features/auth/roles";
import { useAuth, useSession } from "@/features/auth/store";
import { useBranches } from "@/features/company/queries";
import { errorMessage } from "@/lib/api-client";
import { formatPhone } from "@/lib/format";
import { haptic } from "@/lib/haptics";

/**
 * G87: who is signed in (name, email, roles, branch), a new password, and sign out. The API has no
 * signed-in password change (BN-15), so "Change password" emails a link to set a new one.
 */
export function MyAccountScreen() {
  const { user, roles, business, branchId } = useSession();
  const branches = useBranches();
  const branchName = branches.data?.find((branch) => branch.id === branchId)?.name;
  const isGarage = business.type === "garage";
  const [isSigningOut, setIsSigningOut] = useState(false);
  const reset = useMutation({ mutationFn: () => requestPasswordReset(user.email) });

  const sendLink = () =>
    reset.mutate(undefined, {
      onSuccess: () => {
        haptic.confirm();
        showToast({ message: `A link to set a new password is on its way to ${user.email}` });
      },
      onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
    });

  return (
    <Screen header={<Header title="My account" />}>
      <Card className="flex-row items-center gap-3">
        <Avatar name={user.name} />
        <View className="flex-1">
          <Text weight="semibold">{user.name}</Text>
          <Text variant="small" tone="muted">
            {business.name}
          </Text>
        </View>
      </Card>
      <Card className="gap-3">
        <DetailRow label="Email">{user.email}</DetailRow>
        {user.phone ? <DetailRow label="Phone">{formatPhone(user.phone)}</DetailRow> : null}
        {isGarage && branchName ? <DetailRow label="Your branch">{branchName}</DetailRow> : null}
      </Card>
      {isGarage ? (
        <Section title={roles.length === 1 ? "Your role" : "Your roles"}>
          <Card className="gap-3">
            {roles.map((role) => (
              <View key={role} className="gap-0.5">
                <Text weight="medium">{ROLE_LABELS[role]}</Text>
                <Text variant="small" tone="muted">
                  {ROLE_DESCRIPTIONS[role]}
                </Text>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
      <Section title="Sign-in">
        <Card flush>
          <ListRow
            icon={KeyRound}
            title={reset.isPending ? "Sending the link…" : "Change password"}
            subtitle="We email you a link to set a new one"
            onPress={reset.isPending ? undefined : sendLink}
          />
          <ListRow
            icon={LogOut}
            title={isSigningOut ? "Signing out…" : "Sign out"}
            destructive
            divided
            onPress={
              isSigningOut
                ? undefined
                : () => {
                    setIsSigningOut(true);
                    void useAuth.getState().signOut();
                  }
            }
          />
        </Card>
      </Section>
    </Screen>
  );
}
