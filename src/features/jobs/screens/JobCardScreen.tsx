import { router } from "expo-router";
import { FileQuestion } from "lucide-react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NextStepBar, type NextStepView } from "@/components/ui/NextStepBar";
import { can } from "@/features/auth/permissions";
import { useSession } from "@/features/auth/store";
import { BillSection } from "@/features/jobs/components/BillSection";
import { CheckInSection } from "@/features/jobs/components/CheckInSection";
import { EstimateSection } from "@/features/jobs/components/EstimateSection";
import { InspectionSection } from "@/features/jobs/components/InspectionSection";
import { JobCardSkeleton } from "@/features/jobs/components/JobCardSkeleton";
import { JobHero } from "@/features/jobs/components/JobHero";
import { JobHistory } from "@/features/jobs/components/JobHistory";
import { JobStageStrip } from "@/features/jobs/components/JobStageStrip";
import { QualitySection } from "@/features/jobs/components/QualitySection";
import { TechnicianSection } from "@/features/jobs/components/TechnicianSection";
import { TripsSection } from "@/features/jobs/components/TripsSection";
import { nextAction } from "@/features/jobs/next-action";
import { useJobCard } from "@/features/jobs/queries";
import { stepHref } from "@/features/jobs/step-routes";
import type { JobCard } from "@/features/jobs/types";
import { getFinishedStages } from "@/features/jobs/utils";
import type { Role } from "@/features/auth/types";
import { useSafeParam } from "@/lib/params";

/** G31: everything about one job, in the order the work happens, and the one next step. */
export function JobCardScreen() {
  const id = useSafeParam("id");
  const { roles } = useSession();
  const query = useJobCard(id);
  const job = query.data;

  return (
    <Screen
      header={<Header title={job ? `Job ${job.number}` : "Job card"} subtitle={job?.branch.name} />}
      onRefresh={job ? query.refetch : undefined}
      bottomBar={
        job ? (
          <NextStepBar step={toStepView(job, roles)} secondary={secondaryActions(job, roles)} />
        ) : undefined
      }
    >
      {query.isPending && id !== null ? (
        <JobCardSkeleton />
      ) : query.isError && !job ? (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
          what="this job card"
        />
      ) : !job ? (
        <EmptyState
          icon={FileQuestion}
          title="Job card not found"
          message="It may be at another branch, or the link is wrong."
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      ) : (
        <JobCardContent job={job} />
      )}
    </Screen>
  );
}

function JobCardContent({ job }: { job: JobCard }) {
  const finished = getFinishedStages(job);
  return (
    <>
      <JobHero job={job} />
      <JobStageStrip job={job} />
      <JobHistory job={job} />
      <CheckInSection job={job} isDone={finished.has("check_in")} />
      <InspectionSection job={job} isDone={finished.has("inspection")} />
      <EstimateSection job={job} isDone={finished.has("approval")} />
      <TechnicianSection job={job} isDone={finished.has("service")} />
      {job.pickupDrop ? <TripsSection pickupDrop={job.pickupDrop} /> : null}
      <QualitySection job={job} isDone={finished.has("quality_check")} />
      <BillSection job={job} isDone={finished.has("handover")} />
    </>
  );
}

/** While a technician has the job, the desk can hand it to someone else (website `JobStatusCard`). */
function secondaryActions(job: JobCard, roles: Role[]) {
  const isWorking = job.status === "approved" || job.status === "in_progress";
  if (!isWorking || !job.technician || !can(roles, "jobs:manage")) return [];
  return [
    {
      label: "Reassign technician",
      onPress: () =>
        router.push({ pathname: "/job/[id]/assign-technician", params: { id: job.id } }),
    },
  ];
}

function toStepView(job: JobCard, roles: Role[]): NextStepView {
  const action = nextAction(job, roles);
  if (action.kind !== "do") return action;
  return {
    kind: "action",
    label: action.label,
    onPress: () => router.push(stepHref(job.id, action.step)),
  };
}
