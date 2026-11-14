import { router } from "expo-router";
import { FileText } from "lucide-react-native";
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
import { useCan } from "@/features/auth/use-can";
import { useQuotation } from "@/features/quotations/queries";
import type { Quotation } from "@/features/quotations/types";
import { validityText } from "@/features/quotations/utils";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";

/** G61: the quoted lines and how long they hold. Accept (checkout at the quoted prices), Reject, or Ask for a revision. */
export function QuotationScreen() {
  const id = useSafeParam("id");
  const query = useQuotation(id);
  const quotation = query.data;
  return quotation ? (
    <QuotationDetail quotation={quotation} onRefresh={query.refetch} />
  ) : (
    <Screen header={<Header title="Quotation" />}>
      {query.isPending && id !== null ? (
        <Skeleton shape="card" className="h-48 w-full" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          what="this quotation"
        />
      ) : (
        <EmptyState
          icon={FileText}
          title="Quotation not found"
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      )}
    </Screen>
  );
}

function QuotationDetail({
  quotation,
  onRefresh,
}: {
  quotation: Quotation;
  onRefresh: () => Promise<unknown>;
}) {
  const canAnswer = useCan("quotations:respond");
  const validity = validityText(quotation);
  const isOpen = canAnswer && quotation.status === "quoted" && !validity?.startsWith("Ran out");
  const answer = (kind: "reject" | "revision") =>
    router.push({ pathname: "/quotation/[id]/answer", params: { id: quotation.id, kind } });
  return (
    <Screen
      header={<Header title={`Quotation ${quotation.number}`} subtitle={quotation.branch.name} />}
      onRefresh={onRefresh}
      bottomBar={
        isOpen ? (
          <BottomBar>
            <Button
              size="main"
              label="Accept and order"
              onPress={() =>
                router.push({ pathname: "/checkout", params: { quotation: quotation.id } })
              }
            />
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                label="Ask for a revision"
                onPress={() => answer("revision")}
                className="flex-1"
                fullWidth
              />
              <Button
                variant="outline"
                label="Reject"
                onPress={() => answer("reject")}
                className="flex-1"
                fullWidth
              />
            </View>
          </BottomBar>
        ) : quotation.order ? (
          <BottomBar>
            <Button
              size="main"
              label={`Open order ${quotation.order.number}`}
              onPress={() =>
                router.push({ pathname: "/order/[id]", params: { id: quotation.order?.id ?? "" } })
              }
            />
          </BottomBar>
        ) : undefined
      }
    >
      <Card className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text variant="heading">
            {quotation.totalInPaise ? formatPrice(quotation.totalInPaise) : "Being priced"}
          </Text>
          <StatusBadge status={quotation.status} />
        </View>
        <Text variant="small" tone="muted">
          Asked {formatDate(quotation.requestedAt)} · {quotation.itemCount} items
          {quotation.totalInPaise ? " · incl. GST" : ""}
        </Text>
        {validity ? (
          <Text weight="semibold" tone={quotation.status === "quoted" ? "warning" : "muted"}>
            {validity}
          </Text>
        ) : null}
        {quotation.kannaliNotes ? <Text>Kannali: {quotation.kannaliNotes}</Text> : null}
        {quotation.customerNotes ? <Text tone="muted">You: {quotation.customerNotes}</Text> : null}
      </Card>
      <Section title="Parts">
        <Card flush>
          {quotation.items.map((item, index) => {
            const price = item.quotedPriceInPaise ?? item.listPriceInPaise;
            return (
              <View
                key={item.productId}
                className={index ? "gap-1 border-t border-gray-200 p-4" : "gap-1 p-4"}
              >
                <View className="flex-row justify-between gap-3">
                  <Text weight="medium" className="flex-1">
                    {item.name}
                  </Text>
                  <Text weight="semibold" tabular>
                    {formatPrice(price * item.quantity)}
                  </Text>
                </View>
                <Text variant="small" tone="muted" tabular>
                  {item.partNumber} · {formatNumber(item.quantity)} × {formatPrice(price)} excl. GST
                  {item.quotedPriceInPaise && item.quotedPriceInPaise < item.listPriceInPaise
                    ? ` (your price ${formatPrice(item.listPriceInPaise)})`
                    : ""}
                </Text>
              </View>
            );
          })}
        </Card>
      </Section>
      {quotation.subtotalInPaise !== undefined ? (
        <Card className="gap-1.5">
          <View className="flex-row justify-between">
            <Text variant="small" tone="muted">
              Subtotal (excl. GST)
            </Text>
            <Text variant="small" weight="semibold" tabular>
              {formatPrice(quotation.subtotalInPaise)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="small" tone="muted">
              GST
            </Text>
            <Text variant="small" weight="semibold" tabular>
              {formatPrice(quotation.gstInPaise ?? 0)}
            </Text>
          </View>
          <Text variant="small" tone="muted">
            Delivery is added at checkout.
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
