// Copied from spareXB2B/src/features/company/types.ts; the API returns exactly these shapes.

export type BusinessType = "garage" | "fleet" | "dealer" | "retailer" | "reseller" | "corporate";

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
};

export type Business = {
  id: string;
  name: string;
  type: BusinessType;
  /** Optional at registration; businesses without GST can still buy. */
  gstin?: string;
  pan?: string;
  email: string;
  /** E.164, e.g. "+919886044120" */
  phone: string;
  registeredAddress: Address;
  approvedAt: string;
  /** Set by Kannali: the business price is the B2C price less this percentage. */
  discountPercent: number;
  /** Credit screens and payment appear only when true. */
  creditEnabled: boolean;
  photos: string[];
  documents: string[];
};

export type Branch = {
  id: string;
  name: string;
  isMain: boolean;
  address: Address;
  contactName: string;
  contactPhone: string;
  /** Whether customers can book this branch now. */
  acceptingBookings: boolean;
};

/** The minimal branch reference embedded in bookings and job cards. */
export type BranchRef = Pick<Branch, "id" | "name">;
