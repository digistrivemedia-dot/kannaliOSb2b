import { MapPinned } from "lucide-react-native";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Price } from "@/components/ui/Price";
import { Text } from "@/components/ui/Text";
import type { PickupDrop, Trip } from "@/features/jobs/types";
import { formatDateTime } from "@/lib/format";
import { openInMaps } from "@/lib/links";

/** Where a trip stands: no driver yet, on the road with whom, or done and when. */
function tripText(trip: Trip | undefined, doneWord: string): string {
  if (!trip) return "No driver yet";
  if (trip.doneAt) return `${doneWord} by ${trip.driver.name}, ${formatDateTime(trip.doneAt)}`;
  return `${trip.driver.name} is on the way (sent ${formatDateTime(trip.assignedAt)})`;
}

/** The customer asked the garage to fetch the vehicle and bring it back. */
export function TripsSection({ pickupDrop }: { pickupDrop: PickupDrop }) {
  const isSameAddress = pickupDrop.pickupAddress === pickupDrop.dropAddress;
  return (
    <Section title="Pick-up and drop" isDone={Boolean(pickupDrop.drop?.doneAt)}>
      <Card flush>
        <AddressRow
          label={isSameAddress ? "Pick up from and drop at" : "Pick up from"}
          address={pickupDrop.pickupAddress}
        />
        {!isSameAddress && <AddressRow label="Drop at" address={pickupDrop.dropAddress} divided />}
        <View className="gap-3 border-t border-gray-200 p-4">
          <TripRow label="Pick-up" text={tripText(pickupDrop.pickup, "Picked up")} />
          <TripRow label="Delivery" text={tripText(pickupDrop.drop, "Delivered")} />
          <View className="flex-row items-center justify-between">
            <Text variant="small" tone="muted">
              Fee, on the bill
            </Text>
            <Price paise={pickupDrop.feeInPaise} gst="excl" />
          </View>
        </View>
      </Card>
    </Section>
  );
}

function AddressRow({ label, address, divided }: { label: string; address: string; divided?: boolean }) {
  return (
    <View className={divided ? "flex-row items-center gap-2 border-t border-gray-200 py-2 pl-4 pr-2" : "flex-row items-center gap-2 py-2 pl-4 pr-2"}>
      <View className="flex-1 py-1">
        <Text variant="small" tone="muted">
          {label}
        </Text>
        <Text>{address}</Text>
      </View>
      <IconButton icon={MapPinned} label={`Open ${label.toLowerCase()} in maps`} tone="navy" onPress={() => openInMaps(address)} />
    </View>
  );
}

function TripRow({ label, text }: { label: string; text: string }) {
  return (
    <View>
      <Text variant="small" tone="muted">
        {label}
      </Text>
      <Text>{text}</Text>
    </View>
  );
}
