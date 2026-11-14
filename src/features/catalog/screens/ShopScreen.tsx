import { Image } from "expo-image";
import { router } from "expo-router";
import { FilePlus2, ListOrdered, RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useProductFilters } from "@/features/catalog/filter-store";
import { useCatalogFilters, useOffers } from "@/features/catalog/queries";
import { useOrders } from "@/features/orders/queries";
import { useReorder } from "@/features/orders/use-reorder";
import { formatDate, formatPrice } from "@/lib/format";
import { radius } from "@/lib/theme";

/** G50: search by name or part number, order by part number, categories, recent orders with Reorder, offers. */
export function ShopScreen() {
  const [search, setSearch] = useState("");
  const filters = useCatalogFilters();
  const offers = useOffers();
  const recent = useOrders({ sort: "placedAt", order: "desc", pageSize: 3 });
  const { reorder, reorderingId } = useReorder();

  const openProducts = (params: { q?: string; categoryId?: string }) => {
    useProductFilters.getState().set({ categoryId: params.categoryId, inStockOnly: false });
    router.push({ pathname: "/products", params: params.q ? { q: params.q } : {} });
  };

  return (
    <Screen
      inTabs
      header={<TopBar title="Shop" subtitle="Your business prices, excl. GST" showCart />}
      onRefresh={() => Promise.all([filters.refetch(), offers.refetch(), recent.refetch()])}
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

      <Section
        title="Recent orders"
        action={{ label: "All orders", onPress: () => router.push("/orders") }}
      >
        {recent.data?.items.length ? (
          <View className="gap-3">
            {recent.data.items.map((order) => (
              <Card key={order.id} className="gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
                  className="gap-1"
                >
                  <View className="flex-row items-center justify-between">
                    <Text weight="semibold">{order.number}</Text>
                    <StatusBadge status={order.status} />
                  </View>
                  <Text variant="small" tone="muted">
                    {formatDate(order.placedAt)} · {order.itemCount} items ·{" "}
                    {formatPrice(order.totalInPaise)} incl. GST
                  </Text>
                </Pressable>
                <Button
                  variant="outline"
                  icon={RotateCcw}
                  label="Reorder"
                  onPress={() => void reorder(order.id)}
                  loading={reorderingId === order.id}
                />
              </Card>
            ))}
          </View>
        ) : (
          <Text tone="muted">
            {recent.isPending ? "Loading…" : "Your orders show here, ready to order again."}
          </Text>
        )}
      </Section>
    </Screen>
  );
}
