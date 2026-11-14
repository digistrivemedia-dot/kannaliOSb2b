import { router } from "expo-router";
import { useEffect } from "react";
import { Vibration } from "react-native";

import { useCan } from "@/features/auth/use-can";
import { bookingAlert } from "@/features/bookings/alert-state";
import { useBookings } from "@/features/bookings/queries";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { haptic } from "@/lib/haptics";

/** A strong buzz, so a booking is noticed on a noisy workshop floor. */
const ALERT_PATTERN = [0, 500, 250, 500, 250, 500];

/**
 * Opens the new-booking alert (G21) when a booking arrives while the app is open. It shares Today's
 * 15-second poll (the same query), so it adds no requests. Push notifications replace it in Phase 10.
 */
export function NewBookingWatcher() {
  const canBook = useCan("bookings:manage");
  const branch = useActiveBranch();
  const { data } = useBookings(
    { status: "new", branchId: branch.id, sort: "respondBy", order: "asc", pageSize: 20 },
    { enabled: canBook },
  );

  useEffect(() => {
    const now = Date.now();
    const next = data?.items.find(
      (booking) => Date.parse(booking.respondBy) > now && bookingAlert.shouldOpen(booking.id),
    );
    if (!next) return;
    bookingAlert.opened(next.id);
    haptic.alert();
    Vibration.vibrate(ALERT_PATTERN);
    router.push({ pathname: "/booking-alert/[id]", params: { id: next.id } });
  }, [data]);

  return null;
}
