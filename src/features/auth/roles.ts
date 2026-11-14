import type { Role } from "@/features/auth/types";

// Copied from spareXB2B/src/features/auth/roles.ts.

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner / admin",
  manager: "Manager / service advisor",
  technician: "Technician / mechanic",
  spares: "Spares & inventory executive",
  billing: "Billing, QA & delivery executive",
};

/** "Owner / admin", or "Manager / service advisor + 1 more" for someone with several roles. */
export function describeRoles(roles: readonly Role[]): string {
  const [first, ...rest] = roles;
  if (!first) return "";
  const label = ROLE_LABELS[first];
  return rest.length ? `${label} + ${rest.length} more` : label;
}
