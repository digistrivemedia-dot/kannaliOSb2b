import { router } from "expo-router";
import { Truck } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { CountdownRing } from "@/components/ui/CountdownRing";
import { PlateChip } from "@/components/ui/PlateChip";
import { Text } from "@/components/ui/Text";
import type { Booking } from "@/features/bookings/types";
import { BOOKING_ANSWER_MS, bookedServicesText } from "@/features/bookings/utils";
import { vehicleName } from "@/features/jobs/utils";
import { formatPrice, formatWhen } from "@/lib/format";
import { colors } from "@/lib/theme";

/** A booking waiting for this garage's answer, with the time left to give it. */
export function NewBookingCard({ booking }: { booking: Booking }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/booking/[id]", params: { id: booking.id } })}
      accessibilityRole="button"
      accessibilityLabel={`New booking: ${booking.vehicle.plate}, ${vehicleName(booking.vehicle)}, ${formatWhen(booking.slotAt)}`}
      accessibilityHint="Opens the booking to accept or decline"
      className="flex-row items-center gap-4 rounded-card border-2 border-orange-700 bg-white p-4 active:bg-orange-50"
    >
      <CountdownRing deadline={booking.respondBy} totalMs={BOOKING_ANSWER_MS} />
      <View className="flex-1 gap-1.5">
        <Text variant="label" tone="action" sectionLabel>
          New booking
        </Text>
        <PlateChip plate={booking.vehicle.plate} />
        <Text weight="semibold" numberOfLines={1}>
          {vehicleName(booking.vehicle)}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={2}>
          {formatWhen(booking.slotAt)} · {bookedServicesText(booking)}
        </Text>
        {booking.pickupDrop ? (
          <View className="flex-row items-center gap-1.5">
            <Truck size={16} color={colors.navy[700]} />
            <Text variant="small" weight="medium" tone="navy">
              Pick-up and drop · {formatPrice(booking.pickupDrop.feeInPaise)} excl. GST
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
