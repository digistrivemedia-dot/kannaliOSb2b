import { router } from "expo-router";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { CountTile } from "@/components/ui/CountTile";
import { ErrorState } from "@/components/ui/ErrorState";
import { JOB_TABS, TODAY_TILES, type JobTab } from "@/features/jobs/utils";

type Tile = {
  key: string;
  label: string;
  count: number | undefined;
  urgent?: boolean;
  onPress: () => void;
};

type TodayCountsProps = {
  /** Left out for people who don't answer bookings. */
  newBookings?: number;
  isBookingsPending: boolean;
  jobCounts: Partial<Record<JobTab, number>>;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
};

/** Big figures, two to a row; each opens the list behind it. */
export function TodayCounts({
  newBookings,
  isBookingsPending,
  jobCounts,
  isPending,
  error,
  onRetry,
}: TodayCountsProps) {
  const tiles: Tile[] = [
    ...(newBookings !== undefined || isBookingsPending
      ? [
          {
            key: "new-bookings",
            label: "New bookings",
            count: newBookings,
            urgent: true,
            onPress: () => router.push("/bookings"),
          },
        ]
      : []),
    ...TODAY_TILES.map((tab) => ({
      key: tab,
      label: JOB_TABS[tab].label,
      count: jobCounts[tab],
      onPress: () => router.push({ pathname: "/jobs", params: { tab } }),
    })),
  ];
  const rows = Array.from({ length: Math.ceil(tiles.length / 2) }, (_, index) =>
    tiles.slice(index * 2, index * 2 + 2),
  );

  return (
    <Section title="Jobs at this branch">
      {error ? (
        <Card>
          <ErrorState error={error} onRetry={onRetry} what="the counts" />
        </Card>
      ) : (
        <View className="gap-3">
          {rows.map((row) => (
            <View key={row.map((tile) => tile.key).join()} className="flex-row gap-3">
              {row.map((tile) => (
                <CountTile
                  key={tile.key}
                  label={tile.label}
                  count={tile.count ?? 0}
                  loading={tile.count === undefined && (isPending || isBookingsPending)}
                  urgent={tile.urgent}
                  onPress={tile.onPress}
                />
              ))}
              {row.length === 1 && <View className="flex-1" />}
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}
