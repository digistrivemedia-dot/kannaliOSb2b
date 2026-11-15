import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Star } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useCan } from "@/features/auth/use-can";
import { useBranches } from "@/features/company/queries";
import { ReviewSummaryCard } from "@/features/reviews/components/ReviewSummaryCard";
import { useReviewPages, useReviewSummary } from "@/features/reviews/queries";
import type { Review } from "@/features/reviews/types";
import { formatDate } from "@/lib/format";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";

const RATINGS = [
  { value: "all", label: "All" },
  ...[5, 4, 3, 2, 1].map((rating) => ({
    value: String(rating),
    label: rating === 1 ? "1 star" : `${rating} stars`,
  })),
];
const ALL = "all";

/** G84: the average, the breakdown by stars, and the reviews; filter by rating and branch. */
export function ReviewsScreen() {
  const canPickBranch = useCan("garage:all_branches");
  const branches = useBranches();
  const [rating, setRating] = useState(ALL);
  const [branch, setBranch] = useState(ALL);
  const branchId = branch === ALL ? undefined : branch;
  const summary = useReviewSummary(branchId);
  const pages = useReviewPages({
    branchId,
    rating: rating === ALL ? undefined : Number(rating),
  });
  const reviews = allItems(pages.data?.pages);
  const branchChips = [
    { value: ALL, label: "Every branch" },
    ...(branches.data ?? []).map((item) => ({ value: item.id, label: item.name })),
  ];

  const refresh = () => Promise.all([summary.refetch(), pages.refetch()]);

  return (
    <Screen scroll={false} header={<Header title="Reviews" />}>
      {pages.isPending || summary.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          <Skeleton shape="card" className="h-32 w-full" />
          <Skeleton shape="card" className="h-24 w-full" />
        </View>
      ) : summary.isError || (pages.isError && reviews.length === 0) ? (
        <ErrorState
          error={summary.error ?? pages.error}
          onRetry={() => void refresh()}
          what="your reviews"
        />
      ) : (
        <FlashList
          data={reviews}
          keyExtractor={(review) => review.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            <View className="gap-3 pb-3 pt-4">
              <View className="px-4">
                <ReviewSummaryCard summary={summary.data} />
              </View>
              {canPickBranch && branchChips.length > 2 ? (
                <FilterChips
                  label="Branch"
                  options={branchChips}
                  value={branch}
                  onChange={setBranch}
                />
              ) : null}
              <FilterChips label="Rating" options={RATINGS} value={rating} onChange={setRating} />
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-4">
              <ReviewCard review={item} showBranch={canPickBranch && branch === ALL} />
            </View>
          )}
          onEndReached={() =>
            pages.hasNextPage && !pages.isFetchingNextPage && void pages.fetchNextPage()
          }
          refreshControl={
            <RefreshControl
              refreshing={(pages.isRefetching && !pages.isFetchingNextPage) || summary.isRefetching}
              onRefresh={() => void refresh()}
              tintColor={colors.navy[700]}
              colors={[colors.navy[700]]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Star}
              title={rating === ALL ? "No reviews yet" : "No reviews with that rating"}
              message="Customers review their visit in the SpareX app after handover."
            />
          }
        />
      )}
    </Screen>
  );
}

function ReviewCard({ review, showBranch }: { review: Review; showBranch: boolean }) {
  return (
    <Card
      onPress={() => router.push({ pathname: "/job/[id]", params: { id: review.job.id } })}
      accessibilityLabel={`${review.rating} of 5 stars from ${review.customerName}. Open job ${review.job.number}`}
      className="gap-2"
    >
      <View className="flex-row items-center justify-between">
        <View
          className="flex-row gap-0.5"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              color={star <= review.rating ? colors.warning[700] : colors.gray[300]}
              fill={star <= review.rating ? colors.warning[700] : "transparent"}
            />
          ))}
        </View>
        <Text variant="small" tone="muted">
          {formatDate(review.createdAt)}
        </Text>
      </View>
      {review.comment ? <Text>{review.comment}</Text> : null}
      <Text variant="small" tone="muted">
        {review.customerName} · {review.job.number}
        {showBranch ? ` · ${review.branch.name}` : ""}
      </Text>
    </Card>
  );
}
