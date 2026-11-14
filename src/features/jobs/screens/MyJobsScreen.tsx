import { router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobRow } from "@/components/ui/JobRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/features/auth/store";
import { useJobCards } from "@/features/jobs/queries";
import type { JobCardSummary, JobStatus } from "@/features/jobs/types";
import { vehicleName } from "@/features/jobs/utils";
import { formatAge } from "@/lib/format";
import { useNow } from "@/lib/use-now";

/** The technician's jobs, grouped by what they do next (website my-jobs page), plus vehicles to inspect. */
const GROUPS: { title: string; statuses: JobStatus[]; step: string }[] = [
  { title: "New for you", statuses: ["approved"], step: "Accept or hand back" },
  { title: "To inspect", statuses: ["job_card_created"], step: "Start inspection" },
  { title: "Working on", statuses: ["in_progress", "inspection"], step: "Carry on" },
  { title: "Waiting", statuses: ["quality_check", "awaiting_approval"], step: "With the desk" },
];

/** G40: today's work for a technician, most urgent first; tap a job to work on it (G41). */
export function MyJobsScreen() {
  const { user } = useSession();
  const now = useNow(60_000);
  const statuses = GROUPS.flatMap((group) => group.statuses);
  // Without jobs:view the API answers only this person's jobs and the ones waiting to be inspected.
  const query = useJobCards(
    { statuses, sort: "dueAt", order: "asc", pageSize: 100 },
    { live: true },
  );
  const jobs = query.data?.items ?? [];
  const groups = GROUPS.map((group) => ({
    ...group,
    jobs: jobs.filter(
      (job) =>
        group.statuses.includes(job.status) &&
        (job.technician?.id === user.id || (job.status === "job_card_created" && !job.technician)),
    ),
  })).filter((group) => group.jobs.length > 0);

  return (
    <Screen inTabs header={<TopBar title="My jobs" />} onRefresh={query.refetch}>
      {query.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-32 w-full" />
          <Skeleton shape="card" className="h-32 w-full" />
        </View>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="your jobs" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No jobs for you right now"
          message="When the desk assigns you a job, it shows here. Pull down to check again."
        />
      ) : (
        groups.map((group) => (
          <Section key={group.title} title={`${group.title} (${group.jobs.length})`}>
            <View className="gap-3">
              {group.jobs.map((job) => (
                <MyJobRow key={job.id} job={job} step={group.step} now={now} />
              ))}
            </View>
          </Section>
        ))
      )}
    </Screen>
  );
}

function MyJobRow({ job, step, now }: { job: JobCardSummary; step: string; now: Date }) {
  const tasks = job.tasks ? `${job.tasks.done} of ${job.tasks.total} tasks done` : step;
  return (
    <JobRow
      plate={job.vehicle.plate}
      vehicle={vehicleName(job.vehicle)}
      customer={job.number}
      status={job.status}
      age={formatAge(job.createdAt, now)}
      nextStep={job.status === "in_progress" ? tasks : step}
      onPress={() => router.push({ pathname: "/my-job/[id]", params: { id: job.id } })}
    />
  );
}
