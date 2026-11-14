import { Tabs } from "expo-router";
import {
  CalendarClock,
  CircleUserRound,
  ClipboardList,
  House,
  LayoutGrid,
  Menu,
  Package,
  ShoppingBag,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react-native";
import type { ColorValue } from "react-native";

import { useSession } from "@/features/auth/store";
import { NewBookingWatcher } from "@/features/bookings/components/NewBookingWatcher";
import { tabLabel, tabsFor, type TabKey } from "@/features/auth/tabs";
import { colors, fonts } from "@/lib/theme";

const ALL_TABS: TabKey[] = [
  "today",
  "jobs",
  "my-jobs",
  "bookings",
  "shop",
  "orders",
  "trips",
  "home",
  "more",
];

const ICONS: Record<TabKey, LucideIcon> = {
  today: LayoutGrid,
  jobs: ClipboardList,
  "my-jobs": Wrench,
  bookings: CalendarClock,
  shop: ShoppingBag,
  orders: Package,
  trips: Truck,
  home: House,
  more: Menu,
};

/** The bottom tabs for whoever signed in, from `tabsFor` (CLAUDE.md §3). The rest stay hidden. */
export default function TabsLayout() {
  const { roles, business } = useSession();
  const { tabs } = tabsFor(roles, business.type);
  // Tabs show in the order they are declared: this user's first, then the hidden ones.
  const ordered = [...tabs, ...ALL_TABS.filter((tab) => !tabs.includes(tab))];

  return (
    <>
      <NewBookingWatcher />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.navy[800],
          tabBarInactiveTintColor: colors.gray[600],
          tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.gray[200] },
          tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 13 },
        }}
      >
        {ordered.map((tab) => {
          const Icon = tab === "more" && business.type !== "garage" ? CircleUserRound : ICONS[tab];
          return (
            <Tabs.Screen
              key={tab}
              name={tab}
              options={{
                title: tabLabel(tab, business.type),
                href: tabs.includes(tab) ? undefined : null,
                tabBarIcon: ({ color }: { color: ColorValue }) => <Icon size={24} color={color} />,
              }}
            />
          );
        })}
      </Tabs>
    </>
  );
}
