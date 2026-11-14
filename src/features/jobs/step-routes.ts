import type { Href } from "expo-router";

import { plannedHref, type PlannedScreen } from "@/components/layout/ComingSoon";
import type { JobStep } from "@/features/jobs/next-action";

/** The screens built so far; the rest open their placeholder until Phase 6. */
const BUILT: Partial<Record<JobStep, (id: string) => Href>> = {
  check_in: (id) => ({ pathname: "/job/[id]/check-in", params: { id } }),
  record_pickup: (id) => ({ pathname: "/job/[id]/check-in", params: { id } }),
  assign_technician: (id) => ({ pathname: "/job/[id]/assign-technician", params: { id } }),
  inspection: (id) => ({ pathname: "/job/[id]/inspection", params: { id } }),
  estimate: (id) => ({ pathname: "/job/[id]/estimate", params: { id } }),
  record_answer: (id) => ({ pathname: "/job/[id]/answer", params: { id } }),
  quality_check: (id) => ({ pathname: "/job/[id]/quality-check", params: { id } }),
};

/** Steps whose screens Phase 6 builds. */
const PLANNED: Partial<Record<JobStep, PlannedScreen>> = {
  assign_pickup_driver: "G47",
  bill: "G42",
  collect_payment: "G43",
  send_for_delivery: "G47",
  record_delivery: "G44",
  handover: "G44",
};

/** The screen (or form sheet) that takes a job's next step. */
export function stepHref(jobId: string, step: JobStep): Href {
  const planned = PLANNED[step];
  return (
    BUILT[step]?.(jobId) ??
    (planned ? plannedHref(planned) : { pathname: "/job/[id]", params: { id: jobId } })
  );
}
