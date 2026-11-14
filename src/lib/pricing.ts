import { calculateGst } from "@/lib/gst";

// Copied from spareXB2B/src/lib/pricing.ts. The server prices every order itself; these show the
// same numbers before it is placed.

/** Any priced line: cart rows, order lines, quotation lines. Prices exclude GST. */
export type PricedLine = {
  quantity: number;
  unitPriceInPaise: number;
  /** The price the saving is measured against: the B2C price, or the business price for a quote. */
  listPriceInPaise: number;
  gstRatePercent: number;
};

export type PricingSummary = {
  subtotalInPaise: number;
  savingsInPaise: number;
  gstInPaise: number;
};

/** GST is worked out per line, as it is on the GST invoice. */
export function summarisePricing(lines: readonly PricedLine[]): PricingSummary {
  return lines.reduce<PricingSummary>(
    (summary, line) => {
      const lineTotal = line.unitPriceInPaise * line.quantity;
      return {
        subtotalInPaise: summary.subtotalInPaise + lineTotal,
        savingsInPaise:
          summary.savingsInPaise + (line.listPriceInPaise - line.unitPriceInPaise) * line.quantity,
        gstInPaise: summary.gstInPaise + calculateGst(lineTotal, line.gstRatePercent),
      };
    },
    { subtotalInPaise: 0, savingsInPaise: 0, gstInPaise: 0 },
  );
}

/** The B2B delivery rule (from `GET /settings/public`): a charge below a subtotal, both excl. GST. */
export type DeliveryRule = { chargeExclGstInPaise: number; freeFromExclGstInPaise: number };

/** Used until the settings arrive: ₹250, free from ₹5,000 (CLAUDE.md §8 via APP-SCREENS G54). */
export const DEFAULT_DELIVERY_RULE: DeliveryRule = {
  chargeExclGstInPaise: 250_00,
  freeFromExclGstInPaise: 5_000_00,
};

/** Delivery is taxed at the standard rate, like the parts. */
const DELIVERY_GST_PERCENT = 18;

export type OrderTotals = PricingSummary & { deliveryInPaise: number; totalInPaise: number };

/** Everything an order summary shows. */
export function calculateOrderTotals(
  lines: readonly PricedLine[],
  rule: DeliveryRule = DEFAULT_DELIVERY_RULE,
): OrderTotals {
  const pricing = summarisePricing(lines);
  const deliveryInPaise =
    lines.length === 0 || pricing.subtotalInPaise >= rule.freeFromExclGstInPaise
      ? 0
      : rule.chargeExclGstInPaise;
  const gstInPaise = pricing.gstInPaise + calculateGst(deliveryInPaise, DELIVERY_GST_PERCENT);
  return {
    ...pricing,
    deliveryInPaise,
    gstInPaise,
    totalInPaise: pricing.subtotalInPaise + deliveryInPaise + gstInPaise,
  };
}
