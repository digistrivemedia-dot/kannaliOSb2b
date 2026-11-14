import { router } from "expo-router";
import { History, MapPinned, Phone } from "lucide-react-native";
import { View } from "react-native";

import { plannedHref } from "@/components/layout/ComingSoon";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ListRow } from "@/components/ui/ListRow";
import { Price } from "@/components/ui/Price";
import { Text } from "@/components/ui/Text";
import type { Booking } from "@/features/bookings/types";
import { formatPhone, formatWhen } from "@/lib/format";
import { callPhone, openInMaps } from "@/lib/links";

/** What the customer booked: who, the work at its price, when, and pick-up and drop. */
export function BookingFacts({ booking }: { booking: Booking }) {
  const pickup = booking.pickupDrop;
  const isSameAddress = pickup && pickup.pickupAddress === pickup.dropAddress;
  return (
    <>
      <Section title="Customer">
        <Card flush>
          <View className="flex-row items-center gap-3 py-2 pl-4 pr-2">
            <View className="flex-1">
              <Text weight="semibold">{booking.customer.name}</Text>
              <Text variant="small" tone="muted" tabular>
                {formatPhone(booking.customer.phone)}
              </Text>
            </View>
            <IconButton
              icon={Phone}
              tone="navy"
              label={`Call ${booking.customer.name}`}
              onPress={() => callPhone(booking.customer.phone)}
            />
          </View>
          <ListRow
            icon={History}
            title="Vehicle history"
            subtitle="Earlier services, here and at other garages"
            onPress={() => router.push(plannedHref("G83"))}
            divided
          />
        </Card>
      </Section>

      <Section title="Work booked">
        <Card className="gap-3">
          {booking.services.length ? (
            booking.services.map((service) => (
              <View key={service.serviceId} className="flex-row items-start justify-between gap-3">
                <Text className="flex-1">{service.name}</Text>
                <Price paise={service.priceInPaise} gst="excl" />
              </View>
            ))
          ) : (
            <Text tone="muted">No package: the customer described the problem below.</Text>
          )}
          {booking.notes ? (
            <View className="gap-1 rounded-input bg-gray-50 p-3">
              <Text variant="label" tone="muted" sectionLabel>
                Customer's note
              </Text>
              <Text>{booking.notes}</Text>
            </View>
          ) : null}
        </Card>
      </Section>

      <Section title={pickup ? "Pick-up slot" : "Slot"}>
        <Card>
          <Text variant="heading" tabular>
            {formatWhen(booking.slotAt)}
          </Text>
          <Text variant="small" tone="muted">
            {pickup ? "When to collect the vehicle" : "When the customer brings the vehicle in"} ·{" "}
            {booking.branch.name}
          </Text>
        </Card>
      </Section>

      {pickup ? (
        <Section title="Pick-up and drop">
          <Card flush>
            <AddressRow
              label={isSameAddress ? "Pick up from and drop at" : "Pick up from"}
              address={pickup.pickupAddress}
            />
            {!isSameAddress && <AddressRow label="Drop at" address={pickup.dropAddress} divided />}
            <View className="flex-row items-center justify-between border-t border-gray-200 p-4">
              <Text variant="small" tone="muted">
                Your fee, fixed once accepted, plus GST
              </Text>
              <Price paise={pickup.feeInPaise} gst="excl" />
            </View>
          </Card>
        </Section>
      ) : null}
    </>
  );
}

function AddressRow({
  label,
  address,
  divided,
}: {
  label: string;
  address: string;
  divided?: boolean;
}) {
  return (
    <View
      className={
        divided
          ? "flex-row items-center gap-2 border-t border-gray-200 py-2 pl-4 pr-2"
          : "flex-row items-center gap-2 py-2 pl-4 pr-2"
      }
    >
      <View className="flex-1 py-1">
        <Text variant="small" tone="muted">
          {label}
        </Text>
        <Text>{address}</Text>
      </View>
      <IconButton
        icon={MapPinned}
        tone="navy"
        label={`Open ${label.toLowerCase()} in maps`}
        onPress={() => openInMaps(address)}
      />
    </View>
  );
}
