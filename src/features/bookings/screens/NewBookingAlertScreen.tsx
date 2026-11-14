import { router } from "expo-router";
import { CalendarX2, Truck, X } from "lucide-react-native";
import { useEffect } from "react";
import { Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { CountdownRing } from "@/components/ui/CountdownRing";
import { IconButton } from "@/components/ui/IconButton";
import { PlateChip } from "@/components/ui/PlateChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { bookingAlert } from "@/features/bookings/alert-state";
import { useBooking } from "@/features/bookings/queries";
import { useAnswerBooking } from "@/features/bookings/use-answer-booking";
import { BOOKING_ANSWER_MS, bookedServicesText, isAnswerable } from "@/features/bookings/utils";
import { vehicleName } from "@/features/jobs/utils";
import { firstName, formatPrice, formatWhen } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { colors } from "@/lib/theme";
import { useNow } from "@/lib/use-now";

/**
 * G21: full screen when a booking arrives. The vehicle, the work, the slot, pick-up and drop with its
 * fee, and the ring counting down to the answer deadline. Accept, or Decline with a reason.
 */
export function NewBookingAlertScreen() {
  const id = useSafeParam("id");
  const query = useBooking(id);
  const booking = query.data;
  const now = useNow(1000);
  const answer = useAnswerBooking();
  const insets = useSafeAreaInsets();
  const isOpen = booking ? isAnswerable(booking, now) : true;

  useEffect(
    () => () => {
      bookingAlert.closed();
      Vibration.cancel();
    },
    [],
  );

  return (
    <View
      className="flex-1 bg-navy-900"
      style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View className="flex-row items-center justify-between px-4">
        <Text variant="label" tone="inverseMuted" sectionLabel>
          New booking
        </Text>
        <IconButton
          icon={X}
          tone="inverse"
          label="Close, answer later"
          onPress={() => router.back()}
        />
      </View>

      {!booking ? (
        <View
          className="flex-1 items-center justify-center gap-4 px-4"
          accessible
          accessibilityLabel="Loading"
        >
          {query.isPending ? (
            <Skeleton className="h-40 w-40" />
          ) : (
            <Text tone="inverse">This booking can't be opened.</Text>
          )}
        </View>
      ) : !isOpen ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <CalendarX2 size={56} color={colors.navy[200]} />
          <Text variant="title" tone="inverse" className="text-center" accessibilityRole="header">
            This booking went to another garage
          </Text>
          <Text tone="inverseMuted" className="text-center">
            {booking.status === "accepted"
              ? "It was accepted on another phone."
              : "The two minutes to answer ran out."}
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-5 px-6">
          <CountdownRing deadline={booking.respondBy} totalMs={BOOKING_ANSWER_MS} size="large" />
          <View className="items-center gap-2 rounded-card bg-white p-5 self-stretch">
            <PlateChip plate={booking.vehicle.plate} size="large" />
            <Text variant="title" className="text-center">
              {vehicleName(booking.vehicle)}
            </Text>
            <Text tone="muted" className="text-center">
              {firstName(booking.customer.name)} · {bookedServicesText(booking)}
            </Text>
            <Text variant="heading" tabular className="text-center">
              {formatWhen(booking.slotAt)}
            </Text>
            {booking.pickupDrop ? (
              <View className="flex-row items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5">
                <Truck size={18} color={colors.navy[700]} />
                <Text variant="small" weight="semibold" tone="navy">
                  Pick-up and drop · {formatPrice(booking.pickupDrop.feeInPaise)} excl. GST
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <View className="gap-2 px-4">
        {booking && isOpen ? (
          <>
            <Button
              size="main"
              label="Accept"
              onPress={() => answer.accept(booking)}
              loading={answer.isAccepting}
            />
            <Button
              size="main"
              variant="secondary"
              label="Decline"
              onPress={() =>
                router.push({ pathname: "/booking/[id]/decline", params: { id: booking.id } })
              }
            />
          </>
        ) : (
          <Button size="main" variant="secondary" label="Close" onPress={() => router.back()} />
        )}
      </View>
    </View>
  );
}
