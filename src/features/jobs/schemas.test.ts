import {
  approvalSchema,
  collectPaymentSchema,
  handoverSchema,
  qualityCheckSchema,
} from "@/features/jobs/schemas";
import { firstProblem } from "@/lib/validation";

describe("job form rules", () => {
  it("needs an answer for every line waiting on the customer", () => {
    const schema = approvalSchema(["l1", "l2"]);
    expect(firstProblem(schema, { decisions: { l1: "approved" }, note: "By phone" })).toBe(
      "Mark an answer for every line.",
    );
    expect(
      firstProblem(schema, { decisions: { l1: "approved", l2: "rejected" }, note: "By phone" }),
    ).toBeNull();
  });

  it("passes QC only with every check ticked, and sends back only with a note", () => {
    const items = [
      { label: "Brakes", isOk: true },
      { label: "Test ride", isOk: false },
    ];
    expect(firstProblem(qualityCheckSchema, { result: "pass", items })).toBe(
      "Tick every check before passing the vehicle.",
    );
    expect(firstProblem(qualityCheckSchema, { result: "rework", items, note: "" })).toBe(
      "Say what needs redoing.",
    );
    expect(
      firstProblem(qualityCheckSchema, { result: "rework", items, note: "Brake still soft" }),
    ).toBeNull();
  });

  it("takes cash that covers the bill, or an online reference", () => {
    const schema = collectPaymentSchema(150_000);
    expect(firstProblem(schema, { way: "cash", cashInPaise: 140_000 })).toBe(
      "That's less than the bill.",
    );
    expect(firstProblem(schema, { way: "cash", cashInPaise: 200_000 })).toBeNull();
    expect(firstProblem(schema, { way: "online", reference: "123" })).toBe(
      "Enter the UPI or payment reference from the customer's phone.",
    );
  });

  it("hands over with the checklist, the odometer and any cash due at the door", () => {
    const ready = { checklist: [true, true], odometer: "40210", nextDate: "", cashInPaise: 0 };
    expect(firstProblem(handoverSchema(undefined), ready)).toBeNull();
    expect(firstProblem(handoverSchema(undefined), { ...ready, checklist: [true, false] })).toBe(
      "Tick every item before handing the vehicle over.",
    );
    expect(firstProblem(handoverSchema(undefined), { ...ready, nextDate: "31/02/2027" })).toBe(
      "Enter the next service date as DD/MM/YYYY, or leave it empty.",
    );
    expect(firstProblem(handoverSchema(50_000), ready)).toBe("Collect ₹500 in cash first.");
  });
});
