import { router } from "expo-router";

import { JobRow } from "@/components/ui/JobRow";
import type { Role } from "@/features/auth/types";
import { nextAction } from "@/features/jobs/next-action";
import type { JobCardSummary } from "@/features/jobs/types";
import { vehicleName } from "@/features/jobs/utils";
import { formatAge } from "@/lib/format";

/** A job in a list, with the next step this user takes (when it's theirs). */
export function JobListItem({
  job,
  roles,
  now,
}: {
  job: JobCardSummary;
  roles: Role[];
  now: Date;
}) {
  const action = nextAction(job, roles);
  return (
    <JobRow
      plate={job.vehicle.plate}
      vehicle={vehicleName(job.vehicle)}
      customer={job.customer.name}
      status={job.status}
      age={formatAge(job.createdAt, now)}
      technician={job.technician?.name}
      nextStep={action.kind === "do" ? action.label : undefined}
      onPress={() => router.push({ pathname: "/job/[id]", params: { id: job.id } })}
    />
  );
}
