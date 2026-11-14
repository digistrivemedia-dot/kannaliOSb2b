import { router, useLocalSearchParams } from "expo-router";
import { Check, UserX } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useAssignDriver, useBranchStaff, useJobCard } from "@/features/jobs/queries";
import type { TripKind } from "@/features/jobs/types";
import { errorMessage } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { colors } from "@/lib/theme";

/** G47 (form sheet): any staff member can drive; picking one sends them on the pick-up or the delivery. */
export function AssignDriverScreen() {
  const id = useSafeParam("id");
  const params = useLocalSearchParams<{ trip?: string }>();
  const trip: TripKind = params.trip === "drop" ? "drop" : "pickup";
  const { data: job } = useJobCard(id);
  const staff = useBranchStaff(job?.branch.id ?? "", { enabled: Boolean(job) });
  const assign = useAssignDriver(id ?? "");
  const current =
    trip === "pickup" ? job?.pickupDrop?.pickup?.driver.id : job?.pickupDrop?.drop?.driver.id;

  const choose = (driverId: string, name: string) =>
    assign.mutate(
      { trip, driverId },
      {
        onSuccess: () => {
          showToast({
            message:
              trip === "pickup" ? `${name} is going to pick it up` : `${name} is taking it back`,
          });
          router.back();
        },
        onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
      },
    );

  return (
    <View className="flex-1 bg-white">
      <Text variant="heading" accessibilityRole="header" className="px-4 pb-1 pt-6">
        {trip === "pickup" ? "Who picks it up?" : "Who delivers it?"}
      </Text>
      <Text variant="small" tone="muted" className="px-4 pb-2">
        Anyone at the branch can drive. The fewest trips on now first.
      </Text>
      {staff.isPending ? (
        <View className="gap-2 p-4" accessible accessibilityLabel="Loading">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </View>
      ) : staff.isError ? (
        <ErrorState error={staff.error} onRetry={() => void staff.refetch()} what="the staff" />
      ) : staff.data.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="Nobody at this branch"
          message="The owner adds people in Team."
        />
      ) : (
        <ScrollView contentContainerClassName="pb-8" accessibilityRole="radiogroup">
          {[...staff.data]
            .sort((a, b) => a.activeTrips - b.activeTrips)
            .map((person) => {
              const isCurrent = person.id === current;
              return (
                <Pressable
                  key={person.id}
                  disabled={assign.isPending || isCurrent}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isCurrent, busy: assign.isPending }}
                  accessibilityLabel={`${person.name}, ${formatCount(person.activeTrips, "trip")} now`}
                  onPress={() => choose(person.id, person.name)}
                  className="min-h-16 flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
                >
                  <Avatar name={person.name} />
                  <View className="flex-1">
                    <Text weight="semibold">{person.name}</Text>
                    <Text variant="small" tone="muted">
                      {formatCount(person.activeTrips, "trip")} now
                    </Text>
                  </View>
                  {isCurrent && <Check size={24} color={colors.navy[700]} />}
                </Pressable>
              );
            })}
        </ScrollView>
      )}
    </View>
  );
}
