import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Undo2 } from "lucide-react-native";
import { RefreshControl, View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useReturnPages } from "@/features/returns/queries";
import { RETURN_REASONS } from "@/features/returns/utils";
import { allItems } from "@/lib/paging";
import { formatDate, formatPrice } from "@/lib/format";
import { colors } from "@/lib/theme";

/** G59 (list): every return asked for, newest first. */
export function ReturnsScreen() {
  const pages = useReturnPages();
  const returns = allItems(pages.data?.pages);
  return (
    <Screen scroll={false} header={<Header title="Returns" />}>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="p-4">
          <Skeleton shape="card" className="h-28 w-full" />
        </View>
      ) : pages.isError && returns.length === 0 ? (
        <ErrorState error={pages.error} onRetry={() => void pages.refetch()} what="your returns" />
      ) : (
        <FlashList
          data={returns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
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
          renderItem={({ item }) => (
            <Card
              onPress={() => router.push({ pathname: "/return/[id]", params: { id: item.id } })}
              accessibilityLabel={`Return ${item.number}`}
              className="gap-1"
            >
              <View className="flex-row items-center justify-between">
                <Text weight="semibold">{item.number}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text variant="small" tone="muted">
                Order {item.order.number} · {formatDate(item.requestedAt)} ·{" "}
                {RETURN_REASONS[item.reason]}
              </Text>
              <Text variant="small" weight="semibold" tabular>
                {formatPrice(item.refundInPaise)} incl. GST to come back
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={Undo2}
              title="No returns"
              message="Return parts from a delivered order: open it in Orders and tap Return items."
              action={{ label: "Open orders", onPress: () => router.push("/orders") }}
            />
          }
        />
      )}
    </Screen>
  );
}
