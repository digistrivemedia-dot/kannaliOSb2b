import type { TimelineStep } from "@/components/ui/Timeline";
import type {
  EstimateLine,
  FuelLevel,
  InspectionResult,
  JobCard,
  JobStatus,
  JobVehicle,
} from "@/features/jobs/types";
import { formatDateTime } from "@/lib/format";
import { calculateGst } from "@/lib/gst";
import type { Tone } from "@/lib/theme";

// The business logic below is copied from spareXB2B/src/features/job-cards/utils.ts.

/**
 * The main path every job follows, in order. "closed" (no work done) sits outside it. The two
 * trips (out for pick-up, out for delivery) happen only for pick-up & drop bookings.
 */
export const JOB_FLOW: JobStatus[] = [
  "booked",
  "confirmed",
  "out_for_pickup",
  "vehicle_received",
  "job_card_created",
  "inspection",
  "awaiting_approval",
  "approved",
  "in_progress",
  "quality_check",
  "ready",
  "payment_pending",
  "paid",
  "out_for_delivery",
  "completed",
];

/** The full words, for the job's history. Lists use the short words of `statusTone`. */
const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  out_for_pickup: "Out for pick-up",
  vehicle_received: "Vehicle received",
  job_card_created: "Job card created",
  inspection: "Inspection",
  awaiting_approval: "Waiting for customer approval",
  approved: "Approved",
  in_progress: "Service in progress",
  quality_check: "Quality check",
  ready: "Ready for delivery",
  payment_pending: "Payment pending",
  paid: "Paid",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  closed: "Closed, no work done",
};

export const FUEL_LEVEL_LABELS: Record<FuelLevel, string> = {
  empty: "Empty",
  quarter: "¼",
  half: "½",
  three_quarters: "¾",
  full: "Full",
};

export const INSPECTION_RESULTS: Record<InspectionResult, { word: string; tone: Tone }> = {
  ok: { word: "OK", tone: "success" },
  attention: { word: "Needs attention", tone: "warning" },
  replace: { word: "Replace", tone: "danger" },
};

export const ESTIMATE_KIND_LABELS: Record<EstimateLine["kind"], string> = {
  labour: "Labour",
  service: "Service",
  part: "Part",
  consumable: "Consumable",
};

/** Job photos are stored inline, up to 300 KB each (FRONTEND-CHANGES F-39); a little under, to be safe. */
export const MAX_JOB_PHOTO_BYTES = 290 * 1024;

/** "Honda Activa 6G" */
export function vehicleName(vehicle: Pick<JobVehicle, "make" | "model">): string {
  return `${vehicle.make} ${vehicle.model}`.trim();
}

/** What has happened so far. Finished steps get a tick; the step the job is on now is marked. */
export function getJobSteps(job: Pick<JobCard, "status" | "timeline">): TimelineStep[] {
  const isFinished = job.status === "completed" || job.status === "closed";
  const lastIndex = job.timeline.length - 1;
  return job.timeline.map((event, index) => {
    const previous = job.timeline[index - 1];
    const isSideTrip =
      previous &&
      (event.status === "awaiting_approval" || event.status === "in_progress") &&
      JOB_FLOW.indexOf(event.status) < JOB_FLOW.indexOf(previous.status);
    return {
      label: JOB_STATUS_LABELS[event.status],
      when: formatDateTime(event.at),
      note:
        event.note ??
        (isSideTrip
          ? event.status === "awaiting_approval"
            ? "Extra work found"
            : "Sent back after the quality check"
          : undefined),
      state:
        event.status === "closed"
          ? "stopped"
          : index === lastIndex && !isFinished
            ? "current"
            : "done",
    };
  });
}

/** The stages of the work, in order. */
const JOB_STAGES = [
  { key: "check_in", label: "Check-in" },
  { key: "inspection", label: "Inspection" },
  { key: "estimate", label: "Estimate" },
  { key: "approval", label: "Approval" },
  { key: "service", label: "Service" },
  { key: "quality_check", label: "Quality check" },
  { key: "invoice", label: "Bill" },
  { key: "payment", label: "Payment" },
  { key: "handover", label: "Handover" },
] as const;

export type JobStage = "pickup" | (typeof JOB_STAGES)[number]["key"];

/** A pick-up & drop job starts with the pick-up, and its handover is the delivery. */
export function getJobStages(job: Pick<JobCard, "pickupDrop">): { key: JobStage; label: string }[] {
  if (!job.pickupDrop) return [...JOB_STAGES];
  return [
    { key: "pickup", label: "Pick-up" },
    ...JOB_STAGES.map((stage) =>
      stage.key === "handover" ? { ...stage, label: "Delivery" } : stage,
    ),
  ];
}

/**
 * The stages a job has finished. The status alone can't tell, because extra work and rework send
 * a job back, so each stage is read from its own record.
 */
export function getFinishedStages(job: JobCard): Set<JobStage> {
  const lines = job.estimate?.lines ?? [];
  const isPast = (status: JobStatus) =>
    job.status !== "closed" && JOB_FLOW.indexOf(job.status) >= JOB_FLOW.indexOf(status);
  const finished: Record<JobStage, boolean> = {
    pickup: Boolean(job.pickupDrop?.pickup?.doneAt),
    check_in: Boolean(job.checkIn),
    inspection: Boolean(job.inspection),
    estimate: Boolean(job.estimate),
    approval: lines.length > 0 && lines.every((line) => line.approval !== "pending"),
    service: isPast("quality_check"),
    quality_check: isPast("ready"),
    invoice: Boolean(job.invoice),
    payment: Boolean(job.payment),
    handover: Boolean(job.handover),
  };
  return new Set(
    getJobStages(job)
      .map(({ key }) => key)
      .filter((key) => finished[key]),
  );
}

/** Lines that count towards the bill: everything approved. */
export function approvedLines(lines: EstimateLine[]): EstimateLine[] {
  return lines.filter((line) => line.approval === "approved");
}

/** Net, GST and total of the given lines. GST is worked out per line, as on the bill. */
export function sumLines(lines: EstimateLine[]) {
  const subtotalInPaise = lines.reduce((sum, l) => sum + l.unitPriceInPaise * l.quantity, 0);
  const gstInPaise = lines.reduce(
    (sum, l) => sum + calculateGst(l.unitPriceInPaise * l.quantity, l.gstRatePercent),
    0,
  );
  return { subtotalInPaise, gstInPaise, totalInPaise: subtotalInPaise + gstInPaise };
}

/** Jobs still in the garage's hands. */
export const ACTIVE_JOB_STATUSES = JOB_FLOW.filter(
  (status) => status !== "booked" && status !== "completed",
);

/**
 * The job list's chips: every open job, then the statuses grouped by what the garage does next (the
 * website's groups, so nobody has to know the sixteen statuses), then the finished ones. Today's
 * count tiles open the same chips.
 */
export const JOB_TABS = {
  open: { label: "All open", statuses: ACTIVE_JOB_STATUSES },
  arriving: { label: "Arriving", statuses: ["confirmed"] },
  on_the_road: { label: "On the road", statuses: ["out_for_pickup", "out_for_delivery"] },
  received: { label: "Received", statuses: ["vehicle_received", "job_card_created", "inspection"] },
  awaiting_approval: { label: "Waiting for customer", statuses: ["awaiting_approval"] },
  in_progress: { label: "In progress", statuses: ["approved", "in_progress", "quality_check"] },
  ready: { label: "Ready", statuses: ["ready"] },
  payment_pending: { label: "Payment pending", statuses: ["payment_pending"] },
  paid: { label: "To hand over", statuses: ["paid"] },
  completed: { label: "Completed", statuses: ["completed"] },
  closed: { label: "Closed", statuses: ["closed"] },
} satisfies Record<string, { label: string; statuses: JobStatus[] }>;

export type JobTab = keyof typeof JOB_TABS;

export function isJobTab(value: unknown): value is JobTab {
  return typeof value === "string" && value in JOB_TABS;
}

/** Today's count tiles, in order. */
export const TODAY_TILES: JobTab[] = [
  "received",
  "awaiting_approval",
  "in_progress",
  "ready",
  "payment_pending",
];
