import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { PackageSearch, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/features/cart/store";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { countFilters, useProductFilters } from "@/features/catalog/filter-store";
import { useCatalogFilters, useProductPages } from "@/features/catalog/queries";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";
import { useDebounced } from "@/lib/use-debounced";

/** G51: parts as cards (name, part number, your price excl. GST, stock), with search and a Filters sheet. */
export function ProductsScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [search, setSearch] = useState(typeof params.q === "string" ? params.q : "");
  const q = useDebounced(search.trim());
  const filters = useProductFilters();
  const activeBranch = useActiveBranch();
  const branchId = useCart((state) => state.branchId) ?? activeBranch.id;
  const options = useCatalogFilters();
  const pages = useProductPages({
    q: q || undefined,
    categoryId: filters.categoryId,
    brands: filters.brand ? [filters.brand] : undefined,
    vehicleType: filters.vehicleType,
    vehicleBrand: filters.vehicleBrand,
    vehicleId: filters.vehicleId,
    inStockAtBranchId: filters.inStockOnly ? branchId : undefined,
  });
  const products = allItems(pages.data?.pages);
  const filterCount = countFilters(filters);
  const category = options.data?.categories.find((item) => item.id === filters.categoryId);

  return (
    <Screen
      scroll={false}
      header={<Header title={category?.name ?? "Parts"} subtitle="Prices excl. GST" />}
    >
      <View className="flex-row items-center gap-2 px-4 pt-4">
        <View className="flex-1">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Part name or number" />
        </View>
        <Button
          variant={filterCount ? "secondary" : "outline"}
          icon={SlidersHorizontal}
          label={filterCount ? `Filters ${filterCount}` : "Filters"}
          onPress={() => router.push("/products-filters")}
        />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} shape="card" className="h-28 w-full" />
          ))}
        </View>
      ) : pages.isError && products.length === 0 ? (
        <ErrorState error={pages.error} onRetry={() => void pages.refetch()} what="the parts" />
      ) : (
        <FlashList
          data={products}
          keyExtractor={(product) => product.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <ProductCard product={item} branchId={branchId} />}
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
              icon={PackageSearch}
              title="No parts match"
              message={
                filterCount
                  ? "Your filters may be hiding parts."
                  : "Try the part number, or fewer words."
              }
              action={
                filterCount
                  ? { label: "Clear filters", onPress: () => filters.set({ inStockOnly: false }) }
                  : { label: "Order by part number", onPress: () => router.push("/quick-order") }
              }
            />
          }
        />
      )}
    </Screen>
  );
}
