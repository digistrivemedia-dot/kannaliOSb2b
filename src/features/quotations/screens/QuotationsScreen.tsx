import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { FileText } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useQuotationPages } from "@/features/quotations/queries";
import type { QuotationStatus } from "@/features/quotations/types";
import { validityText } from "@/features/quotations/utils";
import { formatDate, formatPrice } from "@/lib/format";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";

const CHIPS: { value: QuotationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "quoted", label: "Waiting for you" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

/** G60: quotations by status, with how long the quoted prices hold. */
export function QuotationsScreen() {
  const [chip, setChip] = useState<QuotationStatus | "all">("all");
  const pages = useQuotationPages(chip === "all" ? undefined : chip);
  const quotations = allItems(pages.data?.pages);
  return (
    <Screen
      scroll={false}
      header={<Header title="Quotations" />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label="Request a quotation"
            onPress={() => router.push("/quotation/new")}
          />
        </BottomBar>
      }
    >
      <View className="pt-4">
        <FilterChips label="Quotations" options={CHIPS} value={chip} onChange={setChip} />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="p-4">
          <Skeleton shape="card" className="h-28 w-full" />
        </View>
      ) : pages.isError && quotations.length === 0 ? (
        <ErrorState
          error={pages.error}
          onRetry={() => void pages.refetch()}
          what="your quotations"
        />
      ) : (
        <FlashList
          data={quotations}
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
          renderItem={({ item }) => {
            const validity = validityText(item);
            return (
              <Card
                onPress={() =>
                  router.push({ pathname: "/quotation/[id]", params: { id: item.id } })
                }
                accessibilityLabel={`Quotation ${item.number}`}
                className="gap-1"
              >
                <View className="flex-row items-center justify-between">
                  <Text weight="semibold">{item.number}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text variant="small" tone="muted">
                  Asked {formatDate(item.requestedAt)} · {item.itemCount} items · {item.branch.name}
                </Text>
                {item.totalInPaise ? (
                  <Text weight="semibold" tabular>
                    {formatPrice(item.totalInPaise)} incl. GST
                  </Text>
                ) : null}
                {validity ? (
                  <Text
                    variant="small"
                    weight="semibold"
                    tone={item.status === "quoted" ? "warning" : "muted"}
                  >
                    {validity}
                  </Text>
                ) : null}
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={FileText}
              title="No quotations here"
              message="Ask Kannali to price a list of parts; quotes hold for 7 days."
            />
          }
        />
      )}
    </Screen>
  );
}
