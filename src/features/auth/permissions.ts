import type { Role } from "@/features/auth/types";

// Copied from spareXB2B/src/features/auth/permissions.ts. The backend checks the same matrix again;
// the app only hides what a user can't use. Final permissions per role wait for the client (G-Q02).

const ALL_PERMISSIONS = [
  "catalog:view",
  "orders:view",
  "orders:place",
  "quotations:view",
  "quotations:respond",
  "credit:view",
  "credit:pay",
  "payments:view",
  "documents:view",
  "company:view",
  "company:manage",
  "users:manage",
  "garage:setup",
  "garage:dashboard",
  "garage:all_branches",
  "bookings:manage",
  "jobs:view",
  "jobs:manage",
  "jobs:inspect",
  "jobs:work",
  "jobs:qa",
  "jobs:billing",
  "jobs:deliver",
  "jobs:drive",
  "jobs:parts",
  "customers:view",
  "reviews:view",
  "reports:view",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

const BUYING: readonly Permission[] = [
  "catalog:view",
  "orders:view",
  "orders:place",
  "quotations:view",
  "quotations:respond",
];

const PERMISSIONS_BY_ROLE: Record<Role, readonly Permission[]> = {
  owner: ALL_PERMISSIONS,
  manager: [
    "garage:dashboard",
    "bookings:manage",
    "jobs:view",
    "jobs:manage",
    "jobs:inspect",
    "jobs:qa",
    "jobs:deliver",
    "jobs:drive",
    "customers:view",
    "reviews:view",
  ],
  technician: ["jobs:work", "jobs:inspect", "jobs:drive"],
  spares: [...BUYING, "jobs:view", "jobs:parts", "jobs:drive"],
  billing: [
    "garage:dashboard",
    "jobs:view",
    "jobs:qa",
    "jobs:billing",
    "jobs:deliver",
    "jobs:drive",
    "customers:view",
  ],
};

/** The only place permissions are checked. Someone with several roles gets all of their permissions. */
export function can(roles: readonly Role[], permission: Permission): boolean {
  return roles.some((role) => PERMISSIONS_BY_ROLE[role].includes(permission));
}
