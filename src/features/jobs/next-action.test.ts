import { nextAction } from "@/features/jobs/next-action";
import { stepHref } from "@/features/jobs/step-routes";
import { jobAt, PICKUP } from "@/test/jobs";

const MANAGER = ["manager"] as const;
const BILLING = ["billing"] as const;
const TECHNICIAN = ["technician"] as const;
const OWNER = ["owner"] as const;

describe("nextAction", () => {
  it.each([
    ["vehicle_received", "Start check-in"],
    ["job_card_created", "Start inspection"],
    ["inspection", "Send estimate"],
    ["awaiting_approval", "Record customer's answer"],
    ["approved", "Assign technician"],
    ["quality_check", "Start QC"],
  ] as const)("gives a manager the step at %s", (status, label) => {
    expect(nextAction(jobAt(status), MANAGER)).toMatchObject({ kind: "do", label });
  });

  it.each([
    ["ready", "Create bill"],
    ["payment_pending", "Collect payment"],
    ["paid", "Hand over"],
  ] as const)("gives billing the step at %s", (status, label) => {
    expect(nextAction(jobAt(status), BILLING)).toMatchObject({ kind: "do", label });
  });

  it("tells someone who can't take the step who does", () => {
    expect(nextAction(jobAt("ready"), TECHNICIAN)).toEqual({
      kind: "waiting",
      text: "With billing",
    });
    expect(nextAction(jobAt("awaiting_approval"), BILLING)).toEqual({
      kind: "waiting",
      text: "Waiting for the customer's approval",
    });
  });

  it("waits for the technician once one is assigned", () => {
    const technician = { id: "usr-imran", name: "Imran Pasha" };
    expect(nextAction(jobAt("approved", { technician }), MANAGER)).toEqual({
      kind: "waiting",
      text: "Waiting for Imran to accept",
    });
    expect(nextAction(jobAt("in_progress", { technician }), OWNER)).toEqual({
      kind: "waiting",
      text: "Imran is working on it",
    });
  });

  it("adds the trips for pick-up and drop", () => {
    expect(nextAction(jobAt("confirmed", { pickupDrop: PICKUP }), MANAGER)).toMatchObject({
      step: "assign_pickup_driver",
    });
    expect(nextAction(jobAt("paid", { pickupDrop: PICKUP }), OWNER)).toMatchObject({
      step: "send_for_delivery",
    });
    const drop = {
      driver: { id: "usr-ravi", name: "Ravi Kumar" },
      assignedAt: "2026-11-15T10:00:00Z",
    };
    expect(
      nextAction(jobAt("out_for_delivery", { pickupDrop: { ...PICKUP, drop } }), TECHNICIAN),
    ).toEqual({ kind: "waiting", text: "Ravi is delivering it" });
  });

  it("says Closed, with the reason when the job card has one", () => {
    expect(nextAction(jobAt("closed"), OWNER)).toEqual({ kind: "done", text: "Closed" });
    const cancelled = jobAt("closed", {
      timeline: [
        { status: "closed", at: "2026-11-15T09:00:00Z", note: "Booking cancelled: plans changed" },
      ],
    });
    expect(nextAction(cancelled, OWNER)).toEqual({
      kind: "done",
      text: "Closed: Booking cancelled: plans changed",
    });
  });

  it("is done once handed over", () => {
    expect(nextAction(jobAt("completed"), OWNER)).toMatchObject({ kind: "done" });
  });

  it("has a screen for every step", () => {
    const steps = [
      "assign_pickup_driver",
      "record_pickup",
      "check_in",
      "inspection",
      "estimate",
      "record_answer",
      "assign_technician",
      "quality_check",
      "bill",
      "collect_payment",
      "send_for_delivery",
      "record_delivery",
      "handover",
    ] as const;
    for (const step of steps) expect(stepHref("jcd_1", step)).toBeTruthy();
  });
});
