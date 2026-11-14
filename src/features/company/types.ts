import type { Role } from "@/features/auth/types";

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

/** What a PIN code lookup returns, used to fill in city and state. */
export type PincodeDetails = {
  pin: string;
  city: string;
  district?: string;
  state: string;
};

export type CompanyUserStatus = "active" | "invited" | "disabled";

export type CompanyUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** One person can hold several roles. */
  roles: Role[];
  /** Staff work at one branch and see only its jobs. */
  branchId: string;
  status: CompanyUserStatus;
  lastActiveAt?: string;
};

export type CompanyUserInput = Pick<CompanyUser, "name" | "email" | "phone" | "roles" | "branchId">;

/** What is sent to add or change a branch (a delivery address, and for a garage a workshop). */
export type BranchInput = Pick<Branch, "name" | "address" | "contactName" | "contactPhone">;

/** A branch as the garage sees it, with how many staff work there. */
export type GarageBranch = Branch & { staffCount: number };
