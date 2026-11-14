import { router } from "expo-router";
import { PackageX, RotateCcw, Share2, Undo2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { Timeline } from "@/components/ui/Timeline";
import { useCan } from "@/features/auth/use-can";
import { useOrderInvoice } from "@/features/documents/queries";
import { OrderTotals } from "@/features/cart/components/OrderTotals";
import { useOrder } from "@/features/orders/queries";
import type { Order } from "@/features/orders/types";
import { useReorder } from "@/features/orders/use-reorder";
import {
  CANCEL_REASONS,
  isCancellable,
  PAYMENT_METHOD_LABELS,
  paymentText,
} from "@/features/orders/utils";
import { formatDate, formatDateTime, formatNumber, formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { shareRemotePdf } from "@/lib/share-pdf";
import { statusTone } from "@/lib/status";

/** G58: the order's timeline, lines, payment and invoice; Cancel until shipped; Return items once delivered; Reorder. */
export function OrderDetailScreen() {
  const id = useSafeParam("id");
  const query = useOrder(id);
  const order = query.data;
  return order ? (
    <OrderDetail order={order} onRefresh={query.refetch} />
  ) : (
    <Screen header={<Header title="Order" />}>
      {query.isPending && id !== null ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-32 w-full" />
          <Skeleton shape="card" className="h-48 w-full" />
        </View>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="this order" />
      ) : (
        <EmptyState
          icon={PackageX}
          title="Order not found"
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      )}
    </Screen>
  );
}

function OrderDetail({ order, onRefresh }: { order: Order; onRefresh: () => Promise<unknown> }) {
  const canPlace = useCan("orders:place");
  const { reorder, reorderingId } = useReorder();
  const [isSharing, setIsSharing] = useState(false);
  const canCancel = canPlace && isCancellable(order.status);
  const canReturn = canPlace && order.status === "delivered";
  const canSeeDocuments = useCan("documents:view");
  const isInvoiced = ["shipped", "out_for_delivery", "delivered"].includes(order.status);
  const invoice = useOrderInvoice(order.id, { enabled: canSeeDocuments && isInvoiced });
  const steps = order.timeline.map((event, index) => ({
    label: statusTone(event.status).word,
    when: formatDateTime(event.at),
    state:
      event.status === "cancelled"
        ? ("stopped" as const)
        : index === order.timeline.length - 1 && order.status !== "delivered"
          ? ("current" as const)
          : ("done" as const),
  }));

  const share = async () => {
    if (!invoice.data?.url) return;
    setIsSharing(true);
    await shareRemotePdf(invoice.data.url, `Invoice ${invoice.data.number}`);
    setIsSharing(false);
  };

  return (
    <Screen
      header={<Header title={`Order ${order.number}`} subtitle={formatDate(order.placedAt)} />}
      onRefresh={onRefresh}
      bottomBar={
        <BottomBar>
          {canReturn ? (
            <Button
              size="main"
              icon={Undo2}
              label="Return items"
              onPress={() =>
                router.push({ pathname: "/order/[id]/return", params: { id: order.id } })
              }
            />
          ) : null}
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              icon={RotateCcw}
              label="Reorder"
              onPress={() => void reorder(order.id)}
              loading={reorderingId === order.id}
              className="flex-1"
              fullWidth
            />
            {canCancel ? (
              <Button
                variant="outline"
                label="Cancel order"
                onPress={() =>
                  router.push({ pathname: "/order/[id]/cancel", params: { id: order.id } })
                }
                className="flex-1"
                fullWidth
              />
            ) : null}
          </View>
        </BottomBar>
      }
    >
      <Card className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text variant="heading">{formatPrice(order.totalInPaise)}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text variant="small" tone="muted">
          {order.itemCount} items · to {order.branch.name}
          {order.poNumber ? ` · PO ${order.poNumber}` : ""}
          {order.expectedDeliveryDate
            ? ` · expected ${formatDate(order.expectedDeliveryDate)}`
            : ""}
        </Text>
        {order.cancellation ? (
          <Text variant="small" tone="danger">
            Cancelled: {CANCEL_REASONS[order.cancellation.reason]}
            {order.cancellation.note ? ` (${order.cancellation.note})` : ""}
          </Text>
        ) : null}
      </Card>

      <Section title="Progress">
        <Card>
          <Timeline steps={steps} />
        </Card>
      </Section>

      <Section title="Parts">
        <Card flush>
          {order.items.map((item, index) => (
            <View
              key={item.productId}
              className={index ? "gap-1 border-t border-gray-200 p-4" : "gap-1 p-4"}
            >
              <View className="flex-row justify-between gap-3">
                <Text weight="medium" className="flex-1">
                  {item.name}
                </Text>
                <Text weight="semibold" tabular>
                  {formatPrice(item.unitPriceInPaise * item.quantity)}
                </Text>
              </View>
              <Text variant="small" tone="muted" tabular>
                {item.partNumber} · {formatNumber(item.quantity)} ×{" "}
                {formatPrice(item.unitPriceInPaise)} excl. GST
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Card>
        <OrderTotals totals={order} />
      </Card>

      <Section title="Payment">
        <Card className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text weight="semibold">{PAYMENT_METHOD_LABELS[order.payment.method]}</Text>
            <StatusBadge status={order.payment.status} />
          </View>
          <Text tone="muted">{paymentText(order.payment)}</Text>
          {order.payment.reference ? (
            <Text variant="small" tone="muted" selectable>
              Reference {order.payment.reference}
            </Text>
          ) : null}
        </Card>
      </Section>

      <Section title="GST invoice">
        <Card className="gap-2">
          {invoice.data?.url ? (
            <>
              <Text weight="semibold">{invoice.data.number}</Text>
              <Button
                variant="outline"
                icon={Share2}
                label="Share PDF"
                onPress={() => void share()}
                loading={isSharing}
              />
            </>
          ) : (
            <Text tone="muted">
              {!isInvoiced
                ? "Made when the order ships."
                : canSeeDocuments
                  ? invoice.isPending
                    ? "Looking for the invoice…"
                    : "Being made. Pull down to check again."
                  : "The owner can share it from Documents."}
            </Text>
          )}
        </Card>
      </Section>
    </Screen>
  );
}
