import { router } from "expo-router";
import { Truck } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { CountdownRing } from "@/components/ui/CountdownRing";
import { PlateChip } from "@/components/ui/PlateChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import type { Booking } from "@/features/bookings/types";
import { BOOKING_ANSWER_MS, bookedServicesText } from "@/features/bookings/utils";
import { vehicleName } from "@/features/jobs/utils";
import { formatWhen } from "@/lib/format";
import { colors } from "@/lib/theme";

/** A booking in the list: slot, plate, vehicle, package, pick-up, and the timer while it's new. */
export function BookingCard({ booking, isOpen }: { booking: Booking; isOpen: boolean }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/booking/[id]", params: { id: booking.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${formatWhen(booking.slotAt)}, ${booking.vehicle.plate}, ${vehicleName(booking.vehicle)}, ${booking.customer.name}`}
      className={
        isOpen
          ? "flex-row items-center gap-3 rounded-card border-2 border-orange-700 bg-white p-4 active:bg-orange-50"
          : "flex-row items-center gap-3 rounded-card border border-gray-200 bg-white p-4 active:bg-gray-50"
      }
    >
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text weight="semibold" tabular>
            {formatWhen(booking.slotAt)}
          </Text>
          {!isOpen && <StatusBadge status={booking.status} />}
        </View>
        <PlateChip plate={booking.vehicle.plate} />
        <Text weight="medium" numberOfLines={1}>
          {vehicleName(booking.vehicle)} · {booking.customer.name}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={2}>
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
      {isOpen && <CountdownRing deadline={booking.respondBy} totalMs={BOOKING_ANSWER_MS} />}
    </Pressable>
  );
}
