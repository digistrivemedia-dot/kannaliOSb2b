import { splitGst } from "@/features/jobs/documents";
import { formatPrice } from "@/lib/format";
import { calculateGst } from "@/lib/gst";
import { calculateOrderTotals, summarisePricing } from "@/lib/pricing";

const RULE = { chargeExclGstInPaise: 25_000, freeFromExclGstInPaise: 500_000 };

describe("money", () => {
  it("formats paise as Indian rupees", () => {
    expect(formatPrice(12_499_900)).toBe("₹1,24,999");
    expect(formatPrice(34_560)).toBe("₹345.60");
    expect(formatPrice(0)).toBe("₹0");
  });

  it("works GST out per line and rounds to the paisa", () => {
    expect(calculateGst(100_000, 18)).toBe(18_000);
    expect(calculateGst(333, 18)).toBe(60);
    const pricing = summarisePricing([
      { quantity: 3, unitPriceInPaise: 333, listPriceInPaise: 400, gstRatePercent: 18 },
      { quantity: 1, unitPriceInPaise: 10_000, listPriceInPaise: 12_000, gstRatePercent: 28 },
    ]);
    expect(pricing).toEqual({
      subtotalInPaise: 10_999,
      savingsInPaise: 2_201,
      gstInPaise: 180 + 2_800,
    });
  });

  it("adds delivery and its GST below the free-delivery amount", () => {
    const totals = calculateOrderTotals(
      [{ quantity: 2, unitPriceInPaise: 100_000, listPriceInPaise: 120_000, gstRatePercent: 18 }],
      RULE,
    );
    expect(totals.deliveryInPaise).toBe(25_000);
    expect(totals.gstInPaise).toBe(36_000 + 4_500);
    expect(totals.totalInPaise).toBe(200_000 + 25_000 + 40_500);
  });

  it("delivers free from the threshold, and charges nothing for an empty cart", () => {
    const big = calculateOrderTotals(
      [{ quantity: 5, unitPriceInPaise: 100_000, listPriceInPaise: 100_000, gstRatePercent: 18 }],
      RULE,
    );
    expect(big.deliveryInPaise).toBe(0);
    expect(calculateOrderTotals([], RULE).totalInPaise).toBe(0);
  });

  it("splits a bill's GST into CGST and SGST that add back up", () => {
    expect(splitGst(18_001)).toEqual({ cgst: 9_001, sgst: 9_000 });
    const { cgst, sgst } = splitGst(4_321);
    expect(cgst + sgst).toBe(4_321);
  });
});
