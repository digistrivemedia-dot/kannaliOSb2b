import { router } from "expo-router";
import { CircleCheckBig } from "lucide-react-native";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobRow } from "@/components/ui/JobRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { NewBookingCard } from "@/features/bookings/components/NewBookingCard";
import type { Booking } from "@/features/bookings/types";
import type { JobCardSummary } from "@/features/jobs/types";
import { vehicleName } from "@/features/jobs/utils";
import { formatAge } from "@/lib/format";
import { colors } from "@/lib/theme";

export type JobNeedingYou = { job: JobCardSummary; nextStep: string };

type NeedsYouNowProps = {
  bookings: Booking[];
  jobs: JobNeedingYou[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  now: Date;
};

/** New bookings first, then the jobs whose next step is this user's, most urgent kind first. */
export function NeedsYouNow({ bookings, jobs, isPending, error, onRetry, now }: NeedsYouNowProps) {
  return (
    <Section title="Needs you now">
      {isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-36 w-full" />
          <Skeleton shape="card" className="h-36 w-full" />
        </View>
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={onRetry} what="what needs you" />
        </Card>
      ) : bookings.length === 0 && jobs.length === 0 ? (
        <Card className="flex-row items-center gap-3">
          <CircleCheckBig size={26} color={colors.success[700]} />
          <View className="flex-1">
            <Text weight="semibold">Nothing needs you right now</Text>
            <Text variant="small" tone="muted">
              New bookings and jobs waiting on you show up here.
            </Text>
          </View>
        </Card>
      ) : (
        <View className="gap-3">
          {bookings.map((booking) => (
            <NewBookingCard key={booking.id} booking={booking} />
          ))}
          {jobs.map(({ job, nextStep }) => (
            <JobRow
              key={job.id}
              plate={job.vehicle.plate}
              vehicle={vehicleName(job.vehicle)}
              customer={job.customer.name}
              status={job.status}
              age={formatAge(job.createdAt, now)}
              technician={job.technician?.name}
              nextStep={nextStep}
              onPress={() => router.push({ pathname: "/job/[id]", params: { id: job.id } })}
            />
          ))}
        </View>
      )}
    </Section>
  );
}
