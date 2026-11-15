import type { EstimateLine, JobCard, JobStatus } from "@/features/jobs/types";

/** The parts of a job card the next-step rule reads. */
export function jobAt(
  status: JobStatus,
  extra: Partial<Pick<JobCard, "technician" | "pickupDrop" | "timeline">> = {},
): Pick<JobCard, "status" | "technician" | "pickupDrop" | "timeline"> {
  return { status, timeline: [], ...extra };
}

export function line(overrides: Partial<EstimateLine> = {}): EstimateLine {
  return {
    id: "l1",
    kind: "labour",
    description: "General service",
    quantity: 1,
    unitPriceInPaise: 100_000,
    gstRatePercent: 18,
    approval: "approved",
    isExtra: false,
    ...overrides,
  };
}

export const PICKUP = {
  pickupAddress: "HSR Layout",
  dropAddress: "HSR Layout",
  feeInPaise: 14_900,
};
