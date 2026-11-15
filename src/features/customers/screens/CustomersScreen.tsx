import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Users } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { CustomerCard } from "@/features/customers/components/CustomerCard";
import { useCustomerPages } from "@/features/customers/queries";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";
import { useDebounced } from "@/lib/use-debounced";

/**
 * G82: the garage's customers, searchable by name, phone or plate. Customers are added with their
 * first walk-in or booking (the API has no "add customer" on its own: BN-14).
 */
export function CustomersScreen() {
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const pages = useCustomerPages(q);
  const customers = allItems(pages.data?.pages);
  const total = pages.data?.pages[0]?.total;
  return (
    <Screen
      scroll={false}
      header={
        <Header
          title="Customers"
          subtitle={total === undefined ? undefined : `${total} on record`}
        />
      }
      bottomBar={
        <BottomBar>
          <Button size="main" label="New walk-in" onPress={() => router.push("/walk-in")} />
        </BottomBar>
      }
    >
      <View className="px-4 pt-4">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Name, phone or plate" />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          <Skeleton shape="card" className="h-32 w-full" />
          <Skeleton shape="card" className="h-32 w-full" />
        </View>
      ) : pages.isError && customers.length === 0 ? (
        <ErrorState
          error={pages.error}
          onRetry={() => void pages.refetch()}
          what="your customers"
        />
      ) : (
        <FlashList
          data={customers}
          keyExtractor={(customer) => customer.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <CustomerCard customer={item} />}
          keyboardShouldPersistTaps="handled"
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
              icon={Users}
              title={q ? "No customer matches" : "No customers yet"}
              message={
                q
                  ? "Try the phone number or the plate."
                  : "Customers are added with their first walk-in or booking."
              }
            />
          }
        />
      )}
    </Screen>
  );
}
