import type { Role } from "@/features/auth/types";
import type { JobNeedingYou } from "@/features/dashboard/components/NeedsYouNow";
import { nextAction } from "@/features/jobs/next-action";
import type { JobCardSummary, JobStatus } from "@/features/jobs/types";
import { firstName, indiaHour } from "@/lib/format";

/**
 * The jobs that can need someone at the desk, most urgent kind first (APP-SCREENS G20): estimates the
 * customer answered, vehicles ready for QC, then bills to make and bills unpaid.
 */
export const NEEDS_YOU_STATUSES: JobStatus[] = ["approved", "quality_check", "ready", "payment_pending"];

/** The jobs whose next step this user takes themselves, in the order above. */
export function jobsNeedingYou(jobs: JobCardSummary[], roles: readonly Role[]): JobNeedingYou[] {
  return jobs
    .flatMap((job) => {
      const action = nextAction(job, roles);
      return action.kind === "do" ? [{ job, nextStep: action.label }] : [];
    })
    .sort(
      (a, b) => NEEDS_YOU_STATUSES.indexOf(a.job.status) - NEEDS_YOU_STATUSES.indexOf(b.job.status),
    );
}

/** "Good morning, Mahesh", by the time in India. */
export function greeting(name: string, now: Date): string {
  const hour = indiaHour(now);
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${part}, ${firstName(name)}`;
}
