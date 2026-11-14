import type { Business } from "@/features/company/types";

// Copied from spareXB2B/src/features/auth/types.ts; the API returns exactly these shapes.

/**
 * The fixed garage roles. Businesses of other types have a single login with the owner role.
 * owner: garage owner / admin · manager: manager / service advisor · technician: technician /
 * mechanic · spares: spares and inventory executive · billing: billing, QA and delivery executive.
 */
export type Role = "owner" | "manager" | "technician" | "spares" | "billing";

/** "sent_back": Kannali asked for corrections; the business edits and resubmits. */
export type ApprovalStatus = "pending" | "sent_back" | "approved" | "rejected";

export type User = {
  id: string;
  name: string;
  email: string;
  /** E.164, e.g. "+919886044120" */
  phone: string;
};

export type Session = {
  user: User;
  business: Business;
  roles: Role[];
  /** The branch the user works at. Owners can switch branch from the top bar. */
  branchId: string;
  approvalStatus: ApprovalStatus;
};

export type SignInRequest = {
  email: string;
  password: string;
};

/** Returned instead of signing in when the account has 2-step verification switched on. */
export type TwoFactorChallenge = {
  status: "two_factor_required";
  challengeId: string;
  /** e.g. "+91 98860 ••120", to show where the code went. */
  maskedPhone: string;
};

export type SignInResult =
  | {
      status: "signed_in";
      sessionToken?: string;
      approvalStatus: ApprovalStatus;
      /** True on first login, before the user has chosen their own password. */
      mustSetPassword: boolean;
      /** The registration reference, for accounts not yet approved. */
      applicationRef?: string;
    }
  | TwoFactorChallenge;
