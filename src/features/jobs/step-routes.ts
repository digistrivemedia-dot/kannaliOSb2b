import type { Href } from "expo-router";

import type { JobStep } from "@/features/jobs/next-action";

/** The screen (or form sheet) that takes each step of a job. */
const STEP_ROUTES: Record<JobStep, (id: string) => Href> = {
  assign_pickup_driver: (id) => ({
    pathname: "/job/[id]/assign-driver",
    params: { id, trip: "pickup" },
  }),
  record_pickup: (id) => ({ pathname: "/job/[id]/check-in", params: { id } }),
  check_in: (id) => ({ pathname: "/job/[id]/check-in", params: { id } }),
  inspection: (id) => ({ pathname: "/job/[id]/inspection", params: { id } }),
  estimate: (id) => ({ pathname: "/job/[id]/estimate", params: { id } }),
  record_answer: (id) => ({ pathname: "/job/[id]/answer", params: { id } }),
  assign_technician: (id) => ({ pathname: "/job/[id]/assign-technician", params: { id } }),
  quality_check: (id) => ({ pathname: "/job/[id]/quality-check", params: { id } }),
  bill: (id) => ({ pathname: "/job/[id]/bill", params: { id } }),
  collect_payment: (id) => ({ pathname: "/job/[id]/collect-payment", params: { id } }),
  send_for_delivery: (id) => ({
    pathname: "/job/[id]/assign-driver",
    params: { id, trip: "drop" },
  }),
  record_delivery: (id) => ({ pathname: "/job/[id]/handover", params: { id } }),
  handover: (id) => ({ pathname: "/job/[id]/handover", params: { id } }),
};

export function stepHref(jobId: string, step: JobStep): Href {
  return STEP_ROUTES[step](jobId);
}
