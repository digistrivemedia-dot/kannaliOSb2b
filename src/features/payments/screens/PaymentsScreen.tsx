import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Wallet } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { PAYMENT_METHOD_LABELS } from "@/features/orders/utils";
import { usePaymentPages } from "@/features/payments/queries";
import type { Payment } from "@/features/payments/types";
import { formatDate, formatPrice } from "@/lib/format";
import { allItems } from "@/lib/paging";
import { colors } from "@/lib/theme";

const CHIPS: { value: Payment["status"] | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "awaiting_confirmation", label: "Waiting for Kannali" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
];

/** G72: every payment to Kannali: date, reference, method, amount, what it paid, status. */
export function PaymentsScreen() {
  const [chip, setChip] = useState<Payment["status"] | "all">("all");
  const pages = usePaymentPages(chip === "all" ? undefined : chip);
  const payments = allItems(pages.data?.pages);
  return (
    <Screen scroll={false} header={<Header title="Payments" />}>
      <View className="pt-4">
        <FilterChips label="Payments" options={CHIPS} value={chip} onChange={setChip} />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="p-4">
          <Skeleton shape="card" className="h-28 w-full" />
        </View>
      ) : pages.isError && payments.length === 0 ? (
        <ErrorState error={pages.error} onRetry={() => void pages.refetch()} what="your payments" />
      ) : (
        <FlashList
          data={payments}
          keyExtractor={(payment) => payment.id}
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
              onPress={() => router.push({ pathname: "/payment/[id]", params: { id: item.id } })}
              accessibilityLabel={`Payment of ${formatPrice(item.amountInPaise)}`}
              className="gap-1"
            >
              <View className="flex-row items-center justify-between">
                <Text weight="semibold" tabular>
                  {formatPrice(item.amountInPaise)}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text variant="small" tone="muted">
                {formatDate(item.date)} · {PAYMENT_METHOD_LABELS[item.method]}
                {item.reference ? ` · ${item.reference}` : ""}
              </Text>
              <Text variant="small" tone="muted" numberOfLines={1}>
                {item.appliedTo.length > 0
                  ? `For ${item.appliedTo.map((applied) => applied.number).join(", ")}`
                  : "Applied to your dues once Kannali confirms it"}
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={Wallet}
              title="No payments here"
              message="Payments for orders and credit invoices show here."
            />
          }
        />
      )}
    </Screen>
  );
}
