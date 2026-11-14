import { router } from "expo-router";
import { CalendarCheck, ChevronRight, Truck } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PlateChip } from "@/components/ui/PlateChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import type { Booking } from "@/features/bookings/types";
import { bookedServicesText } from "@/features/bookings/utils";
import { vehicleName } from "@/features/jobs/utils";
import { formatTime } from "@/lib/format";
import { colors } from "@/lib/theme";

type TodaysBookingsProps = {
  bookings: Booking[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
};

/** Accepted bookings due today, grouped by their slot. */
export function TodaysBookings({ bookings, isPending, error, onRetry }: TodaysBookingsProps) {
  const slots = groupBySlot(bookings);
  return (
    <Section title="Today's bookings">
      {isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-24 w-full" />
        </View>
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={onRetry} what="today's bookings" />
        </Card>
      ) : slots.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="No bookings today"
            message="Bookings customers make in the SpareX app show up here once you accept them."
            action={{ label: "Open bookings", onPress: () => router.push("/bookings") }}
          />
        </Card>
      ) : (
        <View className="gap-4">
          {slots.map(({ time, items }) => (
            <View key={time} className="gap-2">
              <Text weight="semibold" tabular>
                {time}
              </Text>
              <Card flush>
                {items.map((booking, index) => (
                  <BookingRow key={booking.id} booking={booking} divided={index > 0} />
                ))}
              </Card>
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}

function BookingRow({ booking, divided }: { booking: Booking; divided: boolean }) {
  const open = () =>
    booking.jobId
      ? router.push({ pathname: "/job/[id]", params: { id: booking.jobId } })
      : router.push({ pathname: "/booking/[id]", params: { id: booking.id } });
  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${booking.vehicle.plate}, ${vehicleName(booking.vehicle)}, ${booking.customer.name}`}
      className={
        divided
          ? "flex-row items-center gap-3 border-t border-gray-200 p-4 active:bg-gray-50"
          : "flex-row items-center gap-3 p-4 active:bg-gray-50"
      }
    >
      <View className="flex-1 gap-1.5">
        <PlateChip plate={booking.vehicle.plate} />
        <Text weight="semibold" numberOfLines={1}>
          {vehicleName(booking.vehicle)} · {booking.customer.name}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {bookedServicesText(booking)}
        </Text>
        {booking.pickupDrop ? (
          <View className="flex-row items-center gap-1.5">
            <Truck size={16} color={colors.navy[700]} />
            <Text variant="small" weight="medium" tone="navy">
              Pick-up and drop
            </Text>
          </View>
        ) : null}
      </View>
      <ChevronRight size={22} color={colors.gray[500]} />
    </Pressable>
  );
}

function groupBySlot(bookings: Booking[]) {
  const slots = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const time = formatTime(booking.slotAt);
    slots.set(time, [...(slots.get(time) ?? []), booking]);
  }
  return [...slots].map(([time, items]) => ({ time, items }));
}
