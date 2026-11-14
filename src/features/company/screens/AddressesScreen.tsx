import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useCan } from "@/features/auth/use-can";
import { useBranches } from "@/features/company/queries";
import { formatPhone } from "@/lib/format";

/** G77: delivery addresses (the business's branches): add, edit, remove, and the default (main) one. */
export function AddressesScreen() {
  const branches = useBranches();
  const canManage = useCan("company:manage");
  return (
    <Screen
      header={<Header title="Addresses" subtitle="Where orders are delivered" />}
      onRefresh={branches.refetch}
      bottomBar={
        canManage ? (
          <BottomBar>
            <Button
              size="main"
              label="Add an address"
              onPress={() => router.push("/address/new")}
            />
          </BottomBar>
        ) : undefined
      }
    >
      {branches.isPending ? (
        <Skeleton shape="card" className="h-28 w-full" />
      ) : branches.isError ? (
        <ErrorState
          error={branches.error}
          onRetry={() => void branches.refetch()}
          what="your addresses"
        />
      ) : branches.data.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No addresses yet"
          message="Add where your orders should be delivered."
        />
      ) : (
        branches.data.map((branch) => (
          <Card
            key={branch.id}
            onPress={
              canManage
                ? () => router.push({ pathname: "/address/[id]", params: { id: branch.id } })
                : undefined
            }
            accessibilityLabel={`${branch.name}${branch.isMain ? ", default" : ""}. Edit`}
            className="gap-1"
          >
            <View className="flex-row items-center justify-between">
              <Text weight="semibold">{branch.name}</Text>
              {branch.isMain ? <StatusBadge word="Default" tone="info" /> : null}
            </View>
            <Text tone="muted">
              {[
                branch.address.line1,
                branch.address.line2,
                `${branch.address.city} ${branch.address.pin}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
            <Text variant="small" tone="muted">
              {branch.contactName} · {formatPhone(branch.contactPhone)}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
