import { Image } from "expo-image";
import { router } from "expo-router";
import { FilePlus2, ListOrdered } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListRow } from "@/components/ui/ListRow";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useProductFilters } from "@/features/catalog/filter-store";
import { useCatalogFilters, useOffers } from "@/features/catalog/queries";
import { RecentOrders } from "@/features/orders/components/RecentOrders";
import { useRefetchOrders } from "@/features/orders/queries";
import { radius } from "@/lib/theme";

/** G50: search by name or part number, order by part number, categories, recent orders with Reorder, offers. */
export function ShopScreen() {
  const [search, setSearch] = useState("");
  const filters = useCatalogFilters();
  const offers = useOffers();
  const refetchOrders = useRefetchOrders();

  const openProducts = (params: { q?: string; categoryId?: string }) => {
    useProductFilters.getState().set({ categoryId: params.categoryId, inStockOnly: false });
    router.push({ pathname: "/products", params: params.q ? { q: params.q } : {} });
  };

  return (
    <Screen
      inTabs
      header={<TopBar title="Shop" subtitle="Your business prices, excl. GST" showCart />}
      onRefresh={() => Promise.all([filters.refetch(), offers.refetch(), refetchOrders()])}
    >
      <SearchBar value={search} onChangeText={setSearch} placeholder="Part name or number" />
      {search.trim() ? (
        <Button
          variant="secondary"
          label={`Search for "${search.trim()}"`}
          onPress={() => openProducts({ q: search.trim() })}
          fullWidth
        />
      ) : null}
      <Card flush>
        <ListRow
          icon={ListOrdered}
          title="Order by part number"
          subtitle="Type or paste a list"
          onPress={() => router.push("/quick-order")}
        />
        <ListRow
          icon={FilePlus2}
          title="Request a quotation"
          subtitle="For bulk or regular orders"
          onPress={() => router.push("/quotation/new")}
          divided
        />
      </Card>

      {offers.data?.[0] ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={offers.data[0].title}
          onPress={() => openProducts({})}
          className="overflow-hidden rounded-card border border-gray-200 bg-white"
        >
          <Image
            source={{ uri: offers.data[0].imageUrl }}
            accessibilityLabel={offers.data[0].imageAlt}
            contentFit="cover"
            style={{
              height: 120,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
            }}
          />
          <View className="p-3">
            <Text weight="semibold">{offers.data[0].title}</Text>
          </View>
        </Pressable>
      ) : null}

      <Section title="Categories">
        {filters.isPending ? (
          <View accessible accessibilityLabel="Loading" className="flex-row flex-wrap gap-2">
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-12 w-[48%]" />
            ))}
          </View>
        ) : filters.isError ? (
          <ErrorState
            error={filters.error}
            onRetry={() => void filters.refetch()}
            retrying={filters.isRefetching}
            what="the categories"
          />
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {(filters.data?.categories ?? []).map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                onPress={() => openProducts({ categoryId: category.id })}
                className="min-h-14 w-[48.5%] justify-center rounded-button border border-gray-200 bg-white px-3 py-2 active:bg-gray-50"
              >
                <Text weight="medium" numberOfLines={2}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Section>

      <RecentOrders />
    </Screen>
  );
}
