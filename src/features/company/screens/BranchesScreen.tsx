import { router } from "expo-router";
import { Building2 } from "lucide-react-native";
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
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useGarageBranches, useSetAcceptingBookings } from "@/features/company/queries";
import { errorMessage } from "@/lib/api-client";
import { formatPhone } from "@/lib/format";

/**
 * G80 (owners): the garage's branches with their staff, and whether each is taking bookings; add or
 * edit one (address and contact). Opening hours are set for the whole garage in its profile (G81).
 */
export function BranchesScreen() {
  const branches = useGarageBranches();
  const accepting = useSetAcceptingBookings();
  return (
    <Screen
      header={<Header title="Branches" />}
      onRefresh={branches.refetch}
      bottomBar={
        <BottomBar>
          <Button size="main" label="Add a branch" onPress={() => router.push("/address/new")} />
        </BottomBar>
      }
    >
      {branches.isPending ? (
        <Skeleton shape="card" className="h-32 w-full" />
      ) : branches.isError ? (
        <ErrorState
          error={branches.error}
          onRetry={() => void branches.refetch()}
          what="your branches"
        />
      ) : branches.data.length === 0 ? (
        <EmptyState icon={Building2} title="No branches yet" />
      ) : (
        branches.data.map((branch) => (
          <Card key={branch.id} className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text weight="semibold">{branch.name}</Text>
              {branch.isMain ? <StatusBadge word="Main" tone="info" /> : null}
            </View>
            <Text variant="small" tone="muted">
              {[branch.address.line1, branch.address.city, branch.address.pin].join(", ")}
            </Text>
            <Text variant="small" tone="muted">
              {branch.contactName} · {formatPhone(branch.contactPhone)} · {branch.staffCount} staff
            </Text>
            <Switch
              label="Taking bookings"
              description={
                branch.acceptingBookings
                  ? "Customers can book this branch"
                  : "Turned off: no new bookings come here"
              }
              value={branch.acceptingBookings}
              onChange={(isAccepting) =>
                accepting.mutate(
                  { id: branch.id, isAccepting },
                  {
                    onSuccess: () =>
                      showToast({
                        message: isAccepting
                          ? `${branch.name} is taking bookings`
                          : `${branch.name} paused for bookings`,
                      }),
                    onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
                  },
                )
              }
            />
            <Button
              variant="outline"
              label="Edit address and contact"
              onPress={() => router.push({ pathname: "/address/[id]", params: { id: branch.id } })}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}
