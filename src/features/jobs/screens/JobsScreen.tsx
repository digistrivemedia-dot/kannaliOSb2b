import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { ClipboardList, SlidersHorizontal } from "lucide-react-native";
import { useEffect, useState } from "react";
import { RefreshControl, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/features/auth/store";
import { useCan } from "@/features/auth/use-can";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { JobListItem } from "@/features/jobs/components/JobListItem";
import { rangeStart, useJobFilters } from "@/features/jobs/filter-store";
import { useJobCounts, useJobPages } from "@/features/jobs/queries";
import { isJobTab, JOB_TABS, type JobTab } from "@/features/jobs/utils";
import { toIndiaDate } from "@/lib/format";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";
import { useDebounced } from "@/lib/use-debounced";
import { useNow } from "@/lib/use-now";

const TABS = Object.keys(JOB_TABS) as JobTab[];
/** Finished tabs grow without end, so only the open work is counted. */
const COUNTED = TABS.filter((tab) => tab !== "completed" && tab !== "closed");

/** G30: every job at the branch. Search, status chips with counts, a Filters sheet, job rows. */
export function JobsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { roles } = useSession();
  const branch = useActiveBranch();
  const canWalkIn = useCan("jobs:manage");
  const now = useNow(60_000);
  const [tab, setTab] = useState<JobTab>(isJobTab(params.tab) ? params.tab : "open");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const { technicianId, dateRange } = useJobFilters();

  // Today's tiles open this tab with their own chip chosen.
  useEffect(() => {
    if (isJobTab(params.tab)) setTab(params.tab);
  }, [params.tab]);

  const isFinished = tab === "completed" || tab === "closed";
  const extra = {
    technicianId: technicianId ?? undefined,
    from: rangeStart(dateRange, toIndiaDate(now)),
  };
  const pages = useJobPages({
    ...extra,
    statuses: JOB_TABS[tab].statuses,
    branchId: branch.id,
    q: q || undefined,
    // Open work most urgent first (due soonest); finished jobs newest first (website).
    sort: isFinished ? "createdAt" : "dueAt",
    order: isFinished ? "desc" : "asc",
  });
  const counts = useJobCounts(branch.id, COUNTED, extra);
  const jobs = allItems(pages.data?.pages);
  const filterCount = (technicianId ? 1 : 0) + (dateRange !== "any" ? 1 : 0);

  return (
    <Screen inTabs scroll={false} header={<TopBar title="Jobs" />}>
      <View className="gap-3 pt-4">
        <View className="flex-row items-center gap-2 px-4">
          <View className="flex-1">
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Plate, job number or vehicle"
            />
          </View>
          <Button
            variant={filterCount ? "secondary" : "outline"}
            icon={SlidersHorizontal}
            label={filterCount ? `Filters ${filterCount}` : "Filters"}
            onPress={() => router.push("/jobs-filters")}
          />
        </View>
        <FilterChips
          label="Status"
          options={TABS.map((value) => ({
            value,
            label: JOB_TABS[value].label,
            count: counts.counts[value],
          }))}
          value={tab}
          onChange={setTab}
        />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} shape="card" className="h-32 w-full" />
          ))}
        </View>
      ) : pages.isError && jobs.length === 0 ? (
        <ErrorState error={pages.error} onRetry={() => void pages.refetch()} what="the jobs" />
      ) : (
        <FlashList
          data={jobs}
          keyExtractor={(job) => job.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <JobListItem job={item} roles={roles} now={now} />}
          onEndReached={() =>
            pages.hasNextPage && !pages.isFetchingNextPage && void pages.fetchNextPage()
          }
          refreshControl={
            <RefreshControl
              refreshing={pages.isRefetching && !pages.isFetchingNextPage}
              onRefresh={() => void Promise.all([pages.refetch(), counts.refetch()])}
              tintColor={colors.navy[700]}
              colors={[colors.navy[700]]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={ClipboardList}
              title={q ? "Nothing matches" : "No jobs here"}
              message={
                q
                  ? "Try the plate, the job number or the vehicle."
                  : filterCount
                    ? "Your filters may be hiding jobs."
                    : "Jobs move here as the work reaches this step."
              }
              action={
                q
                  ? { label: "Clear search", onPress: () => setSearch("") }
                  : filterCount
                    ? { label: "Change filters", onPress: () => router.push("/jobs-filters") }
                    : canWalkIn
                      ? { label: "New walk-in", onPress: () => router.push("/walk-in") }
                      : undefined
              }
            />
          }
        />
      )}
    </Screen>
  );
}
