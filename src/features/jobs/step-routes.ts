import { plannedHref, type PlannedScreen } from "@/components/layout/ComingSoon";
import type { JobStep } from "@/features/jobs/next-action";

/** The screen (or form sheet) that takes each step. Phases 4–6 swap these for the real routes. */
const STEP_SCREENS: Record<JobStep, PlannedScreen> = {
  assign_pickup_driver: "G47",
  record_pickup: "G33",
  check_in: "G33",
  inspection: "G35",
  estimate: "G36",
  record_answer: "G37",
  assign_technician: "G34",
  quality_check: "G39",
  bill: "G42",
  collect_payment: "G43",
  send_for_delivery: "G47",
  record_delivery: "G44",
  handover: "G44",
};

export function stepHref(step: JobStep) {
  return plannedHref(STEP_SCREENS[step]);
}
