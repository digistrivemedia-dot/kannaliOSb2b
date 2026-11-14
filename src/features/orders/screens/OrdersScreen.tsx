import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Package } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrderPages } from "@/features/orders/queries";
import type { OrderStatus } from "@/features/orders/types";
import { useReorder } from "@/features/orders/use-reorder";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";
import { useDebounced } from "@/lib/use-debounced";

const CHIPS: { value: string; label: string; statuses?: OrderStatus[] }[] = [
  { value: "all", label: "All" },
  {
    value: "open",
    label: "On the way",
    statuses: ["placed", "confirmed", "processing", "packed", "shipped", "out_for_delivery"],
  },
  { value: "delivered", label: "Delivered", statuses: ["delivered"] },
  { value: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
];

/** G57: every order, newest first, with status chips, search by order or PO number, and Reorder. */
export function OrdersScreen() {
  const [chip, setChip] = useState("all");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const pages = useOrderPages({
    statuses: CHIPS.find((option) => option.value === chip)?.statuses,
    q: q || undefined,
    sort: "placedAt",
    order: "desc",
  });
  const orders = allItems(pages.data?.pages);
  const { reorder, reorderingId } = useReorder();

  return (
    <Screen inTabs scroll={false} header={<TopBar title="Orders" />}>
      <View className="gap-3 pt-4">
        <View className="px-4">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Order or PO number" />
        </View>
        <FilterChips label="Orders" options={CHIPS} value={chip} onChange={setChip} />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          <Skeleton shape="card" className="h-36 w-full" />
          <Skeleton shape="card" className="h-36 w-full" />
        </View>
      ) : pages.isError && orders.length === 0 ? (
        <ErrorState error={pages.error} onRetry={() => void pages.refetch()} what="your orders" />
      ) : (
        <FlashList
          data={orders}
          keyExtractor={(order) => order.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onReorder={() => void reorder(item.id)}
              isReordering={reorderingId === item.id}
            />
          )}
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
              icon={Package}
              title={q ? "No orders match" : "No orders here"}
              message={
                q
                  ? "Try the order number or your PO number."
                  : "Orders you place show here, with their delivery and payment."
              }
              action={{ label: "Go to the shop", onPress: () => router.push("/shop") }}
            />
          }
        />
      )}
    </Screen>
  );
}
