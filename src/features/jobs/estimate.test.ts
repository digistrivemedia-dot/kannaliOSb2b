import { sumDraftLines, newEstimateLine } from "@/features/jobs/estimate";
import { approvedLines, sumLines } from "@/features/jobs/utils";
import { line } from "@/test/jobs";

describe("estimate sums", () => {
  const lines = [
    line({ id: "a", unitPriceInPaise: 50_000, quantity: 2, approval: "approved" }),
    line({ id: "b", unitPriceInPaise: 30_000, gstRatePercent: 28, approval: "rejected" }),
    line({ id: "c", unitPriceInPaise: 10_000, approval: "pending", isExtra: true }),
    line({
      id: "d",
      unitPriceInPaise: 25_000,
      gstRatePercent: 5,
      approval: "approved",
      isExtra: true,
    }),
  ];

  it("bills only the approved lines", () => {
    expect(approvedLines(lines).map((l) => l.id)).toEqual(["a", "d"]);
    expect(sumLines(approvedLines(lines))).toEqual({
      subtotalInPaise: 125_000,
      gstInPaise: 18_000 + 1_250,
      totalInPaise: 125_000 + 19_250,
    });
  });

  it("bills nothing when the customer said no to every line", () => {
    const rejected = lines.map((l) => ({ ...l, approval: "rejected" as const }));
    expect(sumLines(approvedLines(rejected)).totalInPaise).toBe(0);
  });

  it("totals lines while they are typed, unfinished ones as zero", () => {
    const typed = [
      { ...newEstimateLine("labour"), quantity: "2", price: "450.50", gst: "18" as const },
      { ...newEstimateLine("part"), quantity: "", price: "", gst: "28" as const },
    ];
    expect(sumDraftLines(typed)).toEqual({
      subtotalInPaise: 90_100,
      gstInPaise: 16_218,
      totalInPaise: 106_318,
    });
  });
});
