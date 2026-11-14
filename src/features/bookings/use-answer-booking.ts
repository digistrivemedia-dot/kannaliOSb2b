import { router } from "expo-router";

import { showToast } from "@/components/ui/Toast";
import { useAcceptBooking } from "@/features/bookings/queries";
import type { Booking } from "@/features/bookings/types";
import { ApiError, errorMessage } from "@/lib/api-client";

/**
 * Accepting needs no confirmation: it isn't destructive, and bookings are answered against the clock
 * (website `BookingDecision`). It opens the job card made for the booking.
 */
export function useAnswerBooking() {
  const accept = useAcceptBooking();
  return {
    isAccepting: accept.isPending,
    accept: (booking: Booking) =>
      accept.mutate(booking.id, {
        onSuccess: (job) => {
          showToast({ message: `Accepted. Job card ${job.number} opened.` });
          router.replace({ pathname: "/job/[id]", params: { id: job.id } });
        },
        onError: (error) =>
          showToast({
            tone: "danger",
            message:
              error instanceof ApiError && error.status === 409
                ? "Too late: this booking was answered or has gone to another garage."
                : errorMessage(error),
          }),
      }),
  };
}
