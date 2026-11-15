import { can, type Permission } from "@/features/auth/permissions";
import type { Role } from "@/features/auth/types";
import type { JobCard } from "@/features/jobs/types";
import { firstName } from "@/lib/format";

/** Every step a job card's bottom bar can lead to. */
export type JobStep =
  | "assign_pickup_driver"
  | "record_pickup"
  | "check_in"
  | "inspection"
  | "estimate"
  | "record_answer"
  | "assign_technician"
  | "quality_check"
  | "bill"
  | "collect_payment"
  | "send_for_delivery"
  | "record_delivery"
  | "handover";

type NextAction =
  /** This user takes the next step. */
  | { kind: "do"; step: JobStep; label: string }
  /** Someone else does, or the job waits for the customer: says who. */
  | { kind: "waiting"; text: string }
  /** Nothing left to do. */
  | { kind: "done"; text: string };

/** What deciding the next step needs: a full job card or a row of the job list. */
type JobForAction = Pick<JobCard, "status" | "technician" | "pickupDrop"> &
  Partial<Pick<JobCard, "timeline">>;

type StepRule = {
  label: string;
  permission: Permission;
  /** What the bar says to someone who can't take this step. */
  waiting: string;
};

const STEPS: Record<JobStep, StepRule> = {
  assign_pickup_driver: {
    label: "Assign pick-up driver",
    permission: "jobs:manage",
    waiting: "Waiting for a pick-up driver",
  },
  record_pickup: { label: "Record pick-up", permission: "jobs:manage", waiting: "Being picked up" },
  check_in: { label: "Start check-in", permission: "jobs:manage", waiting: "Waiting for check-in" },
  inspection: {
    label: "Start inspection",
    permission: "jobs:inspect",
    waiting: "Waiting for inspection",
  },
  estimate: {
    label: "Send estimate",
    permission: "jobs:manage",
    waiting: "Waiting for the estimate",
  },
  record_answer: {
    label: "Record customer's answer",
    permission: "jobs:manage",
    waiting: "Waiting for the customer's approval",
  },
  assign_technician: {
    label: "Assign technician",
    permission: "jobs:manage",
    waiting: "Waiting for a technician",
  },
  quality_check: { label: "Start QC", permission: "jobs:qa", waiting: "Waiting for quality check" },
  bill: { label: "Create bill", permission: "jobs:billing", waiting: "With billing" },
  collect_payment: {
    label: "Collect payment",
    permission: "jobs:billing",
    waiting: "Waiting for payment",
  },
  send_for_delivery: {
    label: "Send for delivery",
    permission: "jobs:deliver",
    waiting: "Waiting for a delivery driver",
  },
  record_delivery: {
    label: "Record delivery",
    permission: "jobs:deliver",
    waiting: "Being delivered",
  },
  handover: { label: "Hand over", permission: "jobs:deliver", waiting: "Waiting for handover" },
};

/**
 * The step a job is at, following the website's `getNextAction` (spareXB2B job-cards/utils.ts).
 * Pick-up & drop jobs add the two trips; a job without a step is waiting on someone outside the
 * garage's desk (the customer, a technician, a driver).
 */
function currentStep(job: JobForAction): JobStep | { waiting: string } | { done: string } {
  const trips = job.pickupDrop;
  const technician = job.technician && firstName(job.technician.name);
  switch (job.status) {
    case "booked":
      return { waiting: "Waiting for the booking to be accepted" };
    case "confirmed":
      if (trips && !trips.pickup) return "assign_pickup_driver";
      return "check_in";
    case "out_for_pickup":
      return "record_pickup";
    case "vehicle_received":
      return "check_in";
    case "job_card_created":
      return "inspection";
    case "inspection":
      return "estimate";
    case "awaiting_approval":
      return "record_answer";
    case "approved":
      return technician ? { waiting: `Waiting for ${technician} to accept` } : "assign_technician";
    case "in_progress":
      return { waiting: technician ? `${technician} is working on it` : "Being serviced" };
    case "quality_check":
      return "quality_check";
    case "ready":
      return "bill";
    // The customer pays online before delivery, or the driver collects cash at the door.
    case "payment_pending":
      return trips && !trips.drop ? "send_for_delivery" : "collect_payment";
    case "paid":
      return trips && !trips.drop ? "send_for_delivery" : "handover";
    case "out_for_delivery":
      return "record_delivery";
    case "completed":
      return { done: "Handed over. Job completed" };
    case "closed":
      return { done: closedText(job) };
  }
}

/** "Closed", with the reason the job card gives (estimate rejected, booking cancelled…) when it has one. */
export function closedText(job: Partial<Pick<JobCard, "timeline">>): string {
  const reason = job.timeline?.findLast((event) => event.status === "closed")?.note;
  return reason ? `Closed: ${reason}` : "Closed";
}

/** The one next step on a job card for this user, or who has it (CLAUDE.md §5, §6). */
export function nextAction(job: JobForAction, roles: readonly Role[]): NextAction {
  const step = currentStep(job);
  if (typeof step !== "string") {
    return "done" in step
      ? { kind: "done", text: step.done }
      : { kind: "waiting", text: step.waiting };
  }
  const rule = STEPS[step];
  if (can(roles, rule.permission)) return { kind: "do", step, label: rule.label };
  // A trip's driver is named while they are on the road.
  const trip =
    step === "record_pickup"
      ? job.pickupDrop?.pickup
      : step === "record_delivery"
        ? job.pickupDrop?.drop
        : undefined;
  if (trip) {
    const doing = step === "record_pickup" ? "picking it up" : "delivering it";
    return { kind: "waiting", text: `${firstName(trip.driver.name)} is ${doing}` };
  }
  return { kind: "waiting", text: rule.waiting };
}
