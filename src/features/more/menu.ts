import type { Href } from "expo-router";
import {
  BarChart3,
  Building2,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileText,
  FileStack,
  ListOrdered,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Undo2,
  UserCog,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react-native";

import { plannedHref } from "@/components/layout/ComingSoon";
import { can, type Permission } from "@/features/auth/permissions";
import type { TabKey } from "@/features/auth/tabs";
import type { Session } from "@/features/auth/types";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: Href;
  permission: Permission;
  /** Garage screens are for garages only. */
  garageOnly?: boolean;
  /** Credit screens appear only when Kannali has turned credit on. */
  requiresCredit?: boolean;
  /** The tab it is, when it is one: a tab on the bar isn't repeated here. */
  tab?: TabKey;
};

type MenuGroup = { title: string; items: MenuItem[] };

/** Everything outside the tabs, grouped as G75 asks (Garage, Buying, Money, Company). */
const GROUPS: MenuGroup[] = [
  {
    title: "Garage",
    items: [
      {
        label: "Jobs",
        icon: ClipboardList,
        href: "/jobs",
        permission: "jobs:view",
        garageOnly: true,
        tab: "jobs",
      },
      {
        label: "My jobs",
        icon: Wrench,
        href: "/my-jobs",
        permission: "jobs:work",
        garageOnly: true,
        tab: "my-jobs",
      },
      {
        label: "Bookings",
        icon: CalendarClock,
        href: "/bookings",
        permission: "bookings:manage",
        garageOnly: true,
        tab: "bookings",
      },
      {
        label: "Trips",
        icon: Truck,
        href: "/trips",
        permission: "jobs:drive",
        garageOnly: true,
        tab: "trips",
      },
      {
        label: "Customers",
        icon: Users,
        href: plannedHref("G82"),
        permission: "customers:view",
        garageOnly: true,
      },
      {
        label: "Reviews",
        icon: Star,
        href: plannedHref("G84"),
        permission: "reviews:view",
        garageOnly: true,
      },
      {
        label: "Reports",
        icon: BarChart3,
        href: plannedHref("G85"),
        permission: "reports:view",
        garageOnly: true,
      },
      {
        label: "Branches",
        icon: Building2,
        href: "/branches",
        permission: "garage:setup",
        garageOnly: true,
      },
      {
        label: "Garage profile",
        icon: Store,
        href: "/garage-profile",
        permission: "garage:setup",
        garageOnly: true,
      },
    ],
  },
  {
    title: "Buying",
    items: [
      { label: "Shop", icon: ShoppingBag, href: "/shop", permission: "catalog:view", tab: "shop" },
      {
        label: "Order by part number",
        icon: ListOrdered,
        href: "/quick-order",
        permission: "orders:place",
      },
      { label: "Orders", icon: Package, href: "/orders", permission: "orders:view", tab: "orders" },
      { label: "Quotations", icon: FileStack, href: "/quotations", permission: "quotations:view" },
      { label: "Returns", icon: Undo2, href: "/returns", permission: "orders:view" },
    ],
  },
  {
    title: "Money",
    items: [
      {
        label: "Credit",
        icon: CreditCard,
        href: "/credit",
        permission: "credit:view",
        requiresCredit: true,
      },
      { label: "Payments", icon: Wallet, href: "/payments", permission: "payments:view" },
      { label: "Documents", icon: FileText, href: "/documents", permission: "documents:view" },
    ],
  },
  {
    title: "Company",
    items: [
      {
        label: "Business profile",
        icon: Building2,
        href: "/business-profile",
        permission: "company:view",
      },
      { label: "Addresses", icon: MapPin, href: "/addresses", permission: "company:view" },
      { label: "Team", icon: UserCog, href: "/team", permission: "users:manage", garageOnly: true },
    ],
  },
];

/** The More menu for this user: what their roles allow, for their business, minus their tabs. */
export function moreMenu(session: Session, tabs: readonly TabKey[]): MenuGroup[] {
  const isGarage = session.business.type === "garage";
  return GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        can(session.roles, item.permission) &&
        (!item.garageOnly || isGarage) &&
        (!item.requiresCredit || session.business.creditEnabled) &&
        !(item.tab && tabs.includes(item.tab)),
    ),
  })).filter((group) => group.items.length > 0);
}
