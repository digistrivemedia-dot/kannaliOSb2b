import type { BusinessType } from "@/features/company/types";

// Copied from spareXB2B/src/features/company/business-types.ts.

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  garage: "Garage / workshop",
  fleet: "Fleet operator",
  dealer: "Dealer",
  retailer: "Spare-parts retailer",
  reseller: "Reseller",
  corporate: "Corporate",
};

export const BUSINESS_TYPES = Object.keys(BUSINESS_TYPE_LABELS) as [
  BusinessType,
  ...BusinessType[],
];
