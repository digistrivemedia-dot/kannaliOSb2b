import { can, type Permission } from "@/features/auth/permissions";
import type { Role } from "@/features/auth/types";
import type { BusinessType } from "@/features/company/types";

export type TabKey =
  | "today"
  | "jobs"
  | "my-jobs"
  | "bookings"
  | "shop"
  | "orders"
  | "trips"
  | "home"
  | "more";

/** The fixed order of the garage tabs, for people with several roles (CLAUDE.md §3). */
const GARAGE_ORDER: TabKey[] = ["today", "jobs", "my-jobs", "bookings", "shop", "orders", "trips"];

/** Each garage role's tabs, from the table in CLAUDE.md §3. */
const TABS_BY_ROLE: Record<Role, TabKey[]> = {
  owner: ["today", "jobs", "bookings", "shop"],
  manager: ["today", "jobs", "bookings", "shop"],
  technician: ["my-jobs", "trips"],
  billing: ["today", "jobs"],
  spares: ["shop", "orders"],
};

/** A tab is left out for anyone who can't use it, whatever their role's list says. */
const TAB_PERMISSION: Partial<Record<TabKey, Permission>> = {
  today: "garage:dashboard",
  jobs: "jobs:view",
  "my-jobs": "jobs:work",
  bookings: "bookings:manage",
  shop: "catalog:view",
  orders: "orders:view",
  trips: "jobs:drive",
};

const MAX_TABS = 4;

export type Tabs = {
  /** The bottom tabs, ending with More (or Account for businesses that aren't garages). */
  tabs: TabKey[];
  /** Tabs that didn't fit: More lists them first. */
  inMore: TabKey[];
};

/** The one place that decides the bottom tabs, from who signed in (CLAUDE.md §3). */
export function tabsFor(roles: readonly Role[], businessType: BusinessType): Tabs {
  if (businessType !== "garage") return { tabs: ["home", "shop", "orders", "more"], inMore: [] };

  const wanted = new Set(roles.flatMap((role) => TABS_BY_ROLE[role]));
  // "Jobs (or My jobs)": whoever sees every job doesn't need a second list of their own.
  if (wanted.has("jobs")) wanted.delete("my-jobs");
  const allowed = GARAGE_ORDER.filter((tab) => {
    const permission = TAB_PERMISSION[tab];
    return wanted.has(tab) && (!permission || can(roles, permission));
  });
  return { tabs: [...allowed.slice(0, MAX_TABS), "more"], inMore: allowed.slice(MAX_TABS) };
}

export const TAB_LABELS: Record<TabKey, string> = {
  today: "Today",
  jobs: "Jobs",
  "my-jobs": "My jobs",
  bookings: "Bookings",
  shop: "Shop",
  orders: "Orders",
  trips: "Trips",
  home: "Home",
  more: "More",
};

/** Businesses that aren't garages have one login, so their last tab is their account. */
export function tabLabel(tab: TabKey, businessType: BusinessType): string {
  return tab === "more" && businessType !== "garage" ? "Account" : TAB_LABELS[tab];
}

/** Where each tab lives, for links that open a tab. */
export const TAB_HREFS = {
  today: "/today",
  jobs: "/jobs",
  "my-jobs": "/my-jobs",
  bookings: "/bookings",
  shop: "/shop",
  orders: "/orders",
  trips: "/trips",
  home: "/home",
  more: "/more",
} as const satisfies Record<TabKey, string>;
