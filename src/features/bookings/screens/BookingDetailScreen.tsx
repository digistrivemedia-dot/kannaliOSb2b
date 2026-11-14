import { router } from "expo-router";
import { CalendarX2 } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CountdownRing } from "@/components/ui/CountdownRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PlateChip } from "@/components/ui/PlateChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { BookingFacts } from "@/features/bookings/components/BookingFacts";
import { useBooking } from "@/features/bookings/queries";
import type { Booking } from "@/features/bookings/types";
import { useAnswerBooking } from "@/features/bookings/use-answer-booking";
import { BOOKING_ANSWER_MS, isAnswerable } from "@/features/bookings/utils";
import { vehicleName } from "@/features/jobs/utils";
import { useSafeParam } from "@/lib/params";
import { useNow } from "@/lib/use-now";

/** G23: one booking. Accept or decline while it's new; after accepting, its job card. */
export function BookingDetailScreen() {
  const id = useSafeParam("id");
  const query = useBooking(id);
  const booking = query.data;
  const now = useNow(1000);
  const answer = useAnswerBooking();
  const isOpen = booking ? isAnswerable(booking, now) : false;

  const bottomBar = !booking ? undefined : isOpen ? (
    <BottomBar>
      <Button
        size="main"
        label="Accept"
        onPress={() => answer.accept(booking)}
        loading={answer.isAccepting}
      />
      <Button
        variant="outline"
        label="Decline"
        fullWidth
        onPress={() =>
          router.push({ pathname: "/booking/[id]/decline", params: { id: booking.id } })
        }
      />
    </BottomBar>
  ) : booking.jobId ? (
    <BottomBar>
      <Button
        size="main"
        label="Open job card"
        onPress={() => router.push({ pathname: "/job/[id]", params: { id: booking.jobId ?? "" } })}
      />
    </BottomBar>
  ) : undefined;

  return (
    <Screen
      header={
        <Header
          title={booking ? `Booking ${booking.number}` : "Booking"}
          subtitle={booking?.branch.name}
        />
      }
      onRefresh={booking ? query.refetch : undefined}
      bottomBar={bottomBar}
    >
      {query.isPending && id !== null ? (
        <View accessible accessibilityLabel="Loading" className="gap-4">
          <Skeleton shape="card" className="h-40 w-full" />
          <Skeleton shape="card" className="h-28 w-full" />
        </View>
      ) : query.isError && !booking ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="this booking" />
      ) : !booking ? (
        <EmptyState
          icon={CalendarX2}
          title="Booking not found"
          message="It may be at another branch, or the link is wrong."
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      ) : (
        <>
          <BookingHero booking={booking} isOpen={isOpen} />
          <BookingFacts booking={booking} />
        </>
      )}
    </Screen>
  );
}

function BookingHero({ booking, isOpen }: { booking: Booking; isOpen: boolean }) {
  const outcome =
    booking.status === "declined"
      ? `Declined: ${booking.declineReason ?? "no reason given"}`
      : booking.status === "missed" || (booking.status === "new" && !isOpen)
        ? "Not answered in time. This booking went to another garage."
        : booking.status === "accepted" && booking.jobNumber
          ? `Accepted. Job card ${booking.jobNumber}.`
          : null;
  return (
    <Card className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <PlateChip plate={booking.vehicle.plate} size="large" />
          <Text variant="title">{vehicleName(booking.vehicle)}</Text>
        </View>
        {isOpen ? (
          <CountdownRing deadline={booking.respondBy} totalMs={BOOKING_ANSWER_MS} />
        ) : (
          <StatusBadge status={booking.status === "new" ? "missed" : booking.status} />
        )}
      </View>
      {isOpen ? (
        <Text weight="semibold" tone="action">
          Answer before the timer runs out, or the booking goes to another garage.
        </Text>
      ) : outcome ? (
        <Text tone="muted">{outcome}</Text>
      ) : null}
    </Card>
  );
}
