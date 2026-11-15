import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import type { Role, Session } from "@/features/auth/types";
import { nextAction } from "@/features/jobs/next-action";
import { ApprovalScreen } from "@/features/jobs/screens/ApprovalScreen";
import { BillScreen } from "@/features/jobs/screens/BillScreen";
import { CollectPaymentScreen } from "@/features/jobs/screens/CollectPaymentScreen";
import { HandoverScreen } from "@/features/jobs/screens/HandoverScreen";
import { JobCardScreen } from "@/features/jobs/screens/JobCardScreen";
import { QualityCheckScreen } from "@/features/jobs/screens/QualityCheckScreen";
import { WalkInScreen } from "@/features/jobs/screens/WalkInScreen";
import { stepHref } from "@/features/jobs/step-routes";
import type { JobCard, JobStatus } from "@/features/jobs/types";
import { approvedLines, sumLines } from "@/features/jobs/utils";
import { fakeApi } from "@/test/fake-api";
import fixture from "@/test/fixtures/job.json";
import managerSession from "@/test/fixtures/manager-session.json";
import { renderScreen } from "@/test/render";
import { setParams } from "@/test/router";

const manager = managerSession as Session;
const billing: Session = { ...manager, roles: ["billing"] };
const recorded = fixture as unknown as JobCard;

/**
 * A walk-in from the desk to handover. The fake job card moves on as each screen posts, the way the
 * backend does; check-in, inspection, the estimate builder and the technician's work happen between
 * renders (their screens need the camera and the technician's phone).
 */
describe("flow: walk-in → check-in → estimate → approval → QC → bill → payment → handover", () => {
  let job: JobCard;
  const moveTo = (status: JobStatus, extra: Partial<JobCard> = {}) => {
    job = {
      ...job,
      ...extra,
      status,
      timeline: [...job.timeline, { status, at: new Date().toISOString() }],
    };
    return job;
  };

  const api = () =>
    fakeApi({
      "GET /garage/vehicles/lookup": null,
      "POST /garage/jobs": () => moveTo("vehicle_received"),
      [`GET /garage/jobs/${recorded.id}`]: () => job,
      [`POST /garage/jobs/${recorded.id}/estimate/approval`]: (body) => {
        const { decisions } = body as { decisions: Record<string, "approved" | "rejected"> };
        const lines = (job.estimate?.lines ?? []).map((line) => ({
          ...line,
          approval: decisions[line.id] ?? line.approval,
        }));
        return moveTo("approved", { estimate: { ...job.estimate, lines }, technician: undefined });
      },
      [`POST /garage/jobs/${recorded.id}/quality-check`]: () => moveTo("ready"),
      [`POST /garage/jobs/${recorded.id}/invoice`]: () => {
        const totals = sumLines(approvedLines(job.estimate?.lines ?? []));
        return moveTo("payment_pending", {
          invoice: { number: "SSTWW/26-27/0042", issuedAt: new Date().toISOString(), ...totals },
        });
      },
      [`POST /garage/jobs/${recorded.id}/payment`]: (body) =>
        moveTo("paid", {
          payment: {
            method: "cash",
            amountInPaise: job.invoice?.totalInPaise ?? 0,
            receivedAt: new Date().toISOString(),
            cashReceivedInPaise: (body as { cashReceivedInPaise: number }).cashReceivedInPaise,
          },
        }),
      [`POST /garage/jobs/${recorded.id}/handover`]: () => moveTo("completed"),
    });

  /** The job card shows this user's next step; tapping it opens that step's screen. */
  async function nextStepFromJobCard(session: Session, label: string) {
    jest.mocked(router.push).mockClear();
    await renderScreen(<JobCardScreen />, { session });
    await fireEvent.press(await screen.findByRole("button", { name: label }));
    const action = nextAction(job, session.roles as Role[]);
    if (action.kind !== "do")
      throw new Error(`No step for ${session.roles.join(", ")} at ${job.status}`);
    expect(router.push).toHaveBeenCalledWith(stepHref(job.id, action.step));
    await screen.unmount();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    job = { ...recorded, status: "vehicle_received", timeline: [], estimate: undefined };
    setParams({ id: recorded.id });
  });

  it("takes a vehicle from the desk to handover", async () => {
    const calls = api();

    // Walk-in at the desk.
    await renderScreen(<WalkInScreen />, { session: manager });
    await fireEvent.changeText(screen.getByLabelText("Number plate"), "ka01ab1234");
    await fireEvent.press(screen.getByRole("button", { name: "Find vehicle" }));
    await fireEvent.changeText(await screen.findByLabelText("Make"), "Honda");
    await fireEvent.changeText(screen.getByLabelText("Model"), "Activa 6G");
    await fireEvent.changeText(screen.getByLabelText("Name"), "Arjun Rao");
    await fireEvent.changeText(screen.getByLabelText("Mobile number"), "9845012345");
    await fireEvent.changeText(screen.getByLabelText("What the customer said"), "Brakes squeak");
    await fireEvent.press(screen.getByRole("button", { name: "Open job card" }));
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/job/[id]/check-in",
        params: { id: recorded.id },
      }),
    );
    expect(calls.posted("/garage/jobs")[0]?.body).toMatchObject({
      branchId: manager.branchId,
      newVehicle: {
        plate: "KA 01 AB 1234",
        make: "Honda",
        model: "Activa 6G",
        customer: { name: "Arjun Rao", phone: "+919845012345" },
      },
      complaints: ["Brakes squeak"],
    });
    await screen.unmount();

    // Check-in, inspection and the estimate, step by step from the job card.
    await nextStepFromJobCard(manager, "Start check-in");
    moveTo("job_card_created", { checkIn: recorded.checkIn });
    await nextStepFromJobCard(manager, "Start inspection");
    moveTo("inspection", { inspection: recorded.inspection });
    await nextStepFromJobCard(manager, "Send estimate");
    const sent = (recorded.estimate?.lines ?? []).map((line) => ({
      ...line,
      approval: "pending" as const,
      isDone: false,
    }));
    moveTo("awaiting_approval", { estimate: { lines: sent, sentAt: new Date().toISOString() } });

    // The customer answered by phone: approve all but the last line.
    await nextStepFromJobCard(manager, "Record customer's answer");
    await renderScreen(<ApprovalScreen />, { session: manager });
    await fireEvent.press(await screen.findByRole("button", { name: "Approve all" }));
    const last = sent.at(-1);
    if (!last) throw new Error("The recorded estimate has no lines");
    await fireEvent.press(screen.getByRole("radio", { name: `${last.description}: Reject` }));
    await fireEvent.press(screen.getByRole("button", { name: "Save the answer" }));
    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(calls.posted(`/garage/jobs/${recorded.id}/estimate/approval`)[0]?.body).toMatchObject({
      decisions: { [last.id]: "rejected" },
    });
    expect(job.status).toBe("approved");
    await screen.unmount();

    // The technician does the work and finishes it.
    await nextStepFromJobCard(manager, "Assign technician");
    moveTo("quality_check", { technician: recorded.technician, progress: recorded.progress });

    // Quality check passes.
    await nextStepFromJobCard(billing, "Start QC");
    await renderScreen(<QualityCheckScreen />, { session: billing });
    for (const check of await screen.findAllByRole("checkbox")) await fireEvent.press(check);
    await fireEvent.press(screen.getByRole("button", { name: "Pass" }));
    await waitFor(() => expect(job.status).toBe("ready"));
    await screen.unmount();

    // The bill, only for the approved lines.
    await nextStepFromJobCard(billing, "Create bill");
    await renderScreen(<BillScreen />, { session: billing });
    await fireEvent.press(await screen.findByRole("button", { name: "Create bill" }));
    await waitFor(() => expect(job.status).toBe("payment_pending"));
    const billed = sumLines(approvedLines(job.estimate?.lines ?? [])).totalInPaise;
    expect(job.invoice?.totalInPaise).toBe(billed);
    expect(billed).toBeLessThan(sumLines(job.estimate?.lines ?? []).totalInPaise);
    await screen.unmount();

    // Cash at the counter.
    await nextStepFromJobCard(billing, "Collect payment");
    await renderScreen(<CollectPaymentScreen />, { session: billing });
    await fireEvent.press(await screen.findByRole("radio", { name: /Cash at the counter/ }));
    await fireEvent.changeText(
      screen.getByLabelText("Cash received"),
      String(Math.ceil(billed / 100)),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Mark as paid" }));
    await waitFor(() => expect(job.status).toBe("paid"));
    expect(calls.posted(`/garage/jobs/${recorded.id}/payment`)[0]?.body).toEqual({
      method: "cash",
      cashReceivedInPaise: Math.ceil(billed / 100) * 100,
    });
    await screen.unmount();

    // Handover.
    await nextStepFromJobCard(billing, "Hand over");
    await renderScreen(<HandoverScreen />, { session: billing });
    for (const item of await screen.findAllByRole("checkbox")) await fireEvent.press(item);
    await fireEvent.press(screen.getByRole("button", { name: "Hand over" }));
    await waitFor(() => expect(job.status).toBe("completed"));
    expect(calls.posted(`/garage/jobs/${recorded.id}/handover`)[0]?.body).toMatchObject({
      odometerKm: expect.any(Number),
      checklist: expect.arrayContaining([
        { label: "Vehicle returned to the customer", isDone: true },
      ]),
    });
    await screen.unmount();

    // Done: the job card says so, with no step left.
    await renderScreen(<JobCardScreen />, { session: billing });
    expect(await screen.findByText("Handed over. Job completed")).toBeTruthy();
  });
});
