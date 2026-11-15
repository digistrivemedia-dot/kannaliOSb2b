import { Star } from "lucide-react-native";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import type { ReviewSummary } from "@/features/reviews/types";
import { formatCount } from "@/lib/format";
import { colors } from "@/lib/theme";

/** The average as a big figure, and how many reviews gave each number of stars. */
export function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  return (
    <Card className="flex-row gap-5">
      <View
        className="items-center justify-center"
        accessible
        accessibilityLabel={`Average ${summary.average.toFixed(1)} of 5 from ${formatCount(summary.count, "review")}`}
      >
        <Text variant="figure" tabular>
          {summary.count ? summary.average.toFixed(1) : "–"}
        </Text>
        <View className="flex-row items-center gap-1">
          <Star size={16} color={colors.warning[700]} fill={colors.warning[700]} />
          <Text variant="small" tone="muted">
            of 5
          </Text>
        </View>
        <Text variant="small" tone="muted">
          {formatCount(summary.count, "review")}
        </Text>
      </View>
      <View className="flex-1 gap-1.5">
        {summary.byRating.map((row) => (
          <View
            key={row.rating}
            className="flex-row items-center gap-2"
            accessible
            accessibilityLabel={`${row.rating} stars: ${row.count}`}
          >
            <Text variant="small" tabular className="w-4">
              {row.rating}
            </Text>
            <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-navy-700"
                style={{ width: `${summary.count ? (row.count / summary.count) * 100 : 0}%` }}
              />
            </View>
            <Text variant="small" tone="muted" tabular className="w-6 text-right">
              {row.count}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
