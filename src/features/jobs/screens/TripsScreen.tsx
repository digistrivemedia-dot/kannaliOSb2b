import { router } from "expo-router";
import { MapPinned, Phone, Truck } from "lucide-react-native";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconButton } from "@/components/ui/IconButton";
import { PlateChip } from "@/components/ui/PlateChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useSession } from "@/features/auth/store";
import { useJobCards } from "@/features/jobs/queries";
import type { JobCardSummary } from "@/features/jobs/types";
import { vehicleName } from "@/features/jobs/utils";
import { formatPrice, formatWhen } from "@/lib/format";
import { callPhone, openInMaps } from "@/lib/links";

/** G46: the pick-ups and drops this person is driving now, soonest first (website my-trips). */
export function TripsScreen() {
  const { user } = useSession();
  const query = useJobCards(
    {
      driverId: user.id,
      statuses: ["out_for_pickup", "out_for_delivery"],
      sort: "dueAt",
      order: "asc",
      pageSize: 50,
    },
    { live: true },
  );
  const trips = query.data?.items ?? [];
  return (
    <Screen inTabs header={<TopBar title="Trips" />} onRefresh={query.refetch}>
      {query.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-44 w-full" />
        </View>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="your trips" />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No trips for you"
          message="When the garage sends you to pick up or deliver a vehicle, it shows here."
        />
      ) : (
        trips.map((job) => <TripCard key={job.id} job={job} />)
      )}
    </Screen>
  );
}

function TripCard({ job }: { job: JobCardSummary }) {
  const isPickup = job.status === "out_for_pickup";
  const address = isPickup ? job.pickupDrop?.pickupAddress : job.pickupDrop?.dropAddress;
  // A drop whose bill isn't paid: the driver collects it at the door (the bill total is the job's amount).
  const cashDue =
    !isPickup && job.amountInPaise && job.status === "out_for_delivery"
      ? job.amountInPaise
      : undefined;
  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text variant="label" tone="action" sectionLabel>
          {isPickup ? "Pick up" : "Deliver"}
        </Text>
        {job.scheduledAt && isPickup ? (
          <Text variant="small" weight="semibold" tabular>
            {formatWhen(job.scheduledAt)}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-3">
        <PlateChip plate={job.vehicle.plate} size="large" />
      </View>
      <Text weight="semibold">{vehicleName(job.vehicle)}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="flex-1">{job.customer.name}</Text>
        <IconButton
          icon={Phone}
          tone="navy"
          label={`Call ${job.customer.name}`}
          onPress={() => callPhone(job.customer.phone)}
        />
      </View>
      {address ? (
        <View className="flex-row items-center gap-2">
          <Text tone="muted" className="flex-1">
            {address}
          </Text>
          <IconButton
            icon={MapPinned}
            tone="navy"
            label="Open the address in maps"
            onPress={() => openInMaps(address)}
          />
        </View>
      ) : null}
      {cashDue ? (
        <Text variant="small" weight="semibold" tone="warning">
          If the bill isn’t paid: collect up to {formatPrice(cashDue)} at the door.
        </Text>
      ) : null}
      <Button
        size="main"
        variant="secondary"
        label={isPickup ? "Picked up" : "Delivered"}
        onPress={() =>
          router.push({
            pathname: isPickup ? "/job/[id]/check-in" : "/job/[id]/handover",
            params: { id: job.id },
          })
        }
      />
    </Card>
  );
}
