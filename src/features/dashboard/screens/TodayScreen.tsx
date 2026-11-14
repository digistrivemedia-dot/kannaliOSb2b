import { router } from "expo-router";
import { CarFront } from "lucide-react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { plannedHref } from "@/components/layout/ComingSoon";
import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { can } from "@/features/auth/permissions";
import { useSession } from "@/features/auth/store";
import { useBookings } from "@/features/bookings/queries";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { NeedsYouNow } from "@/features/dashboard/components/NeedsYouNow";
import { TodayCounts } from "@/features/dashboard/components/TodayCounts";
import { TodaysBookings } from "@/features/dashboard/components/TodaysBookings";
import { greeting, jobsNeedingYou, NEEDS_YOU_STATUSES } from "@/features/dashboard/utils";
import { useJobCards, useJobCounts } from "@/features/jobs/queries";
import { formatWeekday, toIndiaDate } from "@/lib/format";
import { useNow } from "@/lib/use-now";

/** G20: what needs doing now, the branch at a glance, and today's bookings. Refreshes every 15 s. */
export function TodayScreen() {
  const { user, roles } = useSession();
  const branch = useActiveBranch();
  const now = useNow(5000);
  const canBook = can(roles, "bookings:manage");
  const canWalkIn = can(roles, "jobs:manage");

  const newBookings = useBookings(
    { status: "new", branchId: branch.id, sort: "respondBy", order: "asc", pageSize: 20 },
    { enabled: canBook },
  );
  const todaysBookings = useBookings(
    {
      status: "accepted",
      date: toIndiaDate(now),
      branchId: branch.id,
      sort: "slotAt",
      order: "asc",
      pageSize: 50,
    },
    { enabled: canBook },
  );
  const waiting = useJobCards(
    { statuses: NEEDS_YOU_STATUSES, branchId: branch.id, sort: "createdAt", order: "asc", pageSize: 50 },
    { live: true },
  );
  const counts = useJobCounts(branch.id);

  // A booking whose time ran out has gone to another garage, even before the next refetch.
  const openBookings = (newBookings.data?.items ?? []).filter(
    (booking) => Date.parse(booking.respondBy) > now.getTime(),
  );

  const refresh = () =>
    Promise.all([
      canBook && newBookings.refetch(),
      canBook && todaysBookings.refetch(),
      waiting.refetch(),
      counts.refetch(),
    ]);

  return (
    <Screen
      inTabs
      header={<TopBar title={greeting(user.name, now)} subtitle={formatWeekday(now.toISOString())} />}
      onRefresh={refresh}
      bottomBar={
        canWalkIn ? (
          <BottomBar>
            <Button
              size="main"
              icon={CarFront}
              label="New walk-in"
              onPress={() => router.push(plannedHref("G32"))}
            />
          </BottomBar>
        ) : undefined
      }
    >
      <NeedsYouNow
        bookings={openBookings}
        jobs={jobsNeedingYou(waiting.data?.items ?? [], roles)}
        isPending={waiting.isPending || (canBook && newBookings.isPending)}
        error={waiting.error ?? (canBook ? newBookings.error : null)}
        onRetry={() => void Promise.all([waiting.refetch(), canBook && newBookings.refetch()])}
        now={now}
      />
      <TodayCounts
        newBookings={canBook ? newBookings.data?.total : undefined}
        isBookingsPending={canBook && newBookings.isPending}
        jobCounts={counts.counts}
        isPending={counts.isPending}
        error={counts.error}
        onRetry={() => void counts.refetch()}
      />
      {canBook && (
        <TodaysBookings
          bookings={todaysBookings.data?.items ?? []}
          isPending={todaysBookings.isPending}
          error={todaysBookings.error}
          onRetry={() => void todaysBookings.refetch()}
        />
      )}
    </Screen>
  );
}
