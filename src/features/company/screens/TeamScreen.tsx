import { router } from "expo-router";
import { Users } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { ROLE_LABELS } from "@/features/auth/roles";
import { useBranches, useCompanyUsers } from "@/features/company/queries";

/** G78 (garages, owners): the people, their roles, branch and status; Add person. */
export function TeamScreen() {
  const users = useCompanyUsers();
  const branches = useBranches();
  const branchName = (id: string) => branches.data?.find((branch) => branch.id === id)?.name ?? "";
  return (
    <Screen
      header={<Header title="Team" />}
      onRefresh={users.refetch}
      bottomBar={
        <BottomBar>
          <Button size="main" label="Add person" onPress={() => router.push("/person/new")} />
        </BottomBar>
      }
    >
      {users.isPending ? (
        <Skeleton shape="card" className="h-24 w-full" />
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => void users.refetch()} what="your team" />
      ) : users.data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Just you so far"
          message="Add your manager, technicians and billing staff."
        />
      ) : (
        users.data.items.map((person) => (
          <Card
            key={person.id}
            onPress={() => router.push({ pathname: "/person/[id]", params: { id: person.id } })}
            accessibilityLabel={`${person.name}, ${person.status}. Edit`}
            className="flex-row gap-3"
          >
            <Avatar name={person.name} />
            <View className="flex-1 gap-1">
              <View className="flex-row items-center justify-between gap-2">
                <Text weight="semibold" className="flex-1" numberOfLines={1}>
                  {person.name}
                </Text>
                <StatusBadge status={person.status} />
              </View>
              <Text variant="small" tone="muted">
                {branchName(person.branchId)} · {person.email}
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {person.roles.map((role) => (
                  <StatusBadge
                    key={role}
                    word={ROLE_LABELS[role].split(" / ")[0] ?? role}
                    tone="neutral"
                  />
                ))}
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
