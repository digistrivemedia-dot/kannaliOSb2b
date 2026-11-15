import { router } from "expo-router";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrders } from "@/features/orders/queries";
import { useReorder } from "@/features/orders/use-reorder";

/** The last three orders with Reorder, on Shop and Home. */
export function RecentOrders() {
  const recent = useOrders({ sort: "placedAt", order: "desc", pageSize: 3 });
  const { reorder, reorderingId } = useReorder();
  return (
    <Section
      title="Recent orders"
      action={{ label: "All orders", onPress: () => router.push("/orders") }}
    >
      {recent.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-32 w-full" />
        </View>
      ) : recent.isError ? (
        <ErrorState
          error={recent.error}
          onRetry={() => void recent.refetch()}
          retrying={recent.isRefetching}
          what="your orders"
        />
      ) : recent.data.items.length === 0 ? (
        <Text tone="muted">Your orders show here, ready to order again.</Text>
      ) : (
        <View className="gap-3">
          {recent.data.items.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onReorder={() => void reorder(order.id)}
              isReordering={reorderingId === order.id}
            />
          ))}
        </View>
      )}
    </Section>
  );
}
