import { FlashList } from "@shopify/flash-list";
import { CalendarCheck, CalendarClock, CalendarX, History } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { useBookingCounts, useBookingPages } from "@/features/bookings/queries";
import type { BookingFilters, BookingStatus } from "@/features/bookings/types";
import { isAnswerable } from "@/features/bookings/utils";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";
import { useDebounced } from "@/lib/use-debounced";
import { useNow } from "@/lib/use-now";

const TABS: { value: BookingStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "missed", label: "Missed" },
];

/**
 * What each tab asks for. "Accepted" shows what is still to come (slot today or later), soonest
 * first; earlier ones are already job cards.
 */
const FILTERS: Record<BookingStatus, BookingFilters> = {
  new: { status: "new", sort: "respondBy", order: "asc" },
  accepted: { view: "upcoming", sort: "slotAt", order: "asc" },
  declined: { status: "declined", sort: "slotAt", order: "desc" },
  missed: { status: "missed", sort: "respondBy", order: "desc" },
};

const EMPTY = {
  new: {
    icon: CalendarClock,
    title: "No new bookings",
    message: "When a customer books, it shows here with a timer, and the alert opens.",
  },
  accepted: {
    icon: CalendarCheck,
    title: "Nothing coming up",
    message: "Bookings you accept show here until their day has passed.",
  },
  declined: {
    icon: CalendarX,
    title: "No declined bookings",
    message: "Bookings you turn down show here with the reason.",
  },
  missed: {
    icon: History,
    title: "No missed bookings",
    message: "Bookings not answered within two minutes show here.",
  },
};

/** G22: the branch's bookings by tab, newest answers first, refreshed every 15 s. */
export function BookingsScreen() {
  const branch = useActiveBranch();
  const now = useNow(5000);
  const [tab, setTab] = useState<BookingStatus>("new");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const pages = useBookingPages({ ...FILTERS[tab], branchId: branch.id, q: q || undefined });
  const counts = useBookingCounts(branch.id, ["new", "declined", "missed"]);
  const bookings = allItems(pages.data?.pages);
  const empty = EMPTY[tab];

  return (
    <Screen inTabs scroll={false} header={<TopBar title="Bookings" />}>
      <View className="gap-3 pt-4">
        <View className="px-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Plate, booking number or vehicle"
          />
        </View>
        <FilterChips
          label="Bookings"
          options={TABS.map((option) => ({
            ...option,
            count: option.value === "accepted" ? undefined : counts[option.value],
          }))}
          value={tab}
          onChange={setTab}
        />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} shape="card" className="h-36 w-full" />
          ))}
        </View>
      ) : pages.isError && bookings.length === 0 ? (
        <ErrorState error={pages.error} onRetry={() => void pages.refetch()} what="the bookings" />
      ) : (
        <FlashList
          data={bookings}
          keyExtractor={(booking) => booking.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <BookingCard booking={item} isOpen={isAnswerable(item, now)} />}
          onEndReached={() =>
            pages.hasNextPage && !pages.isFetchingNextPage && void pages.fetchNextPage()
          }
          refreshControl={
            <RefreshControl
              refreshing={pages.isRefetching && !pages.isFetchingNextPage}
              onRefresh={() => void pages.refetch()}
              tintColor={colors.navy[700]}
              colors={[colors.navy[700]]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={empty.icon}
              title={q ? "Nothing matches" : empty.title}
              message={q ? "Try the plate or the booking number." : empty.message}
              action={q ? { label: "Clear search", onPress: () => setSearch("") } : undefined}
            />
          }
        />
      )}
    </Screen>
  );
}
