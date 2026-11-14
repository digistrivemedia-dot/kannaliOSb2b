import { router } from "expo-router";
import { CircleCheckBig } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { BankDetails } from "@/features/checkout/components/BankDetails";
import { useOrder, usePayOrderDemo } from "@/features/orders/queries";
import { paymentText, PAYMENT_METHOD_LABELS } from "@/features/orders/utils";
import { errorMessage } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { colors } from "@/lib/theme";

const NEXT_STEPS = [
  "Kannali confirms the order and packs it at the warehouse.",
  "You get the GST invoice when it ships, with tracking.",
  "It's delivered to your branch. Track it in Orders.",
];

/** G56: the order number, where its payment stands, and what happens next. Online orders pay here. */
export function OrderPlacedScreen() {
  const id = useSafeParam("id");
  const query = useOrder(id);
  const order = query.data;
  const pay = usePayOrderDemo(id ?? "");
  const needsOnlinePayment =
    order?.payment.method === "razorpay" &&
    order.payment.status !== "paid" &&
    order.status !== "cancelled";

  const payNow = (outcome: "success" | "failure") =>
    pay.mutate(outcome, {
      onSuccess: () => showToast({ message: "Payment received" }),
      onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
    });

  return (
    <Screen
      header={<Header title="Order placed" showBack={false} />}
      onRefresh={order ? query.refetch : undefined}
      bottomBar={
        order ? (
          <BottomBar>
            {needsOnlinePayment ? (
              <>
                <Button
                  size="main"
                  label={`Pay ${formatPrice(order.totalInPaise)} (demo)`}
                  onPress={() => payNow("success")}
                  loading={pay.isPending}
                />
                <Button
                  variant="ghost"
                  label="Try a failed payment (demo)"
                  onPress={() => payNow("failure")}
                  fullWidth
                />
              </>
            ) : (
              <Button
                size="main"
                label="View order"
                onPress={() =>
                  router.replace({ pathname: "/order/[id]", params: { id: order.id } })
                }
              />
            )}
            <Button
              variant="ghost"
              label="Back to the shop"
              onPress={() => router.dismissTo("/shop")}
              fullWidth
            />
          </BottomBar>
        ) : undefined
      }
    >
      {!order ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-40 w-full" />
        </View>
      ) : (
        <>
          <Card className="items-center gap-2 py-6">
            <CircleCheckBig size={48} color={colors.success[700]} />
            <Text variant="title" accessibilityRole="header">
              {order.number}
            </Text>
            <Text tone="muted">
              {order.itemCount} items · {formatPrice(order.totalInPaise)} incl. GST · to{" "}
              {order.branch.name}
            </Text>
          </Card>
          <Section title="Payment">
            <Card className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text weight="semibold">{PAYMENT_METHOD_LABELS[order.payment.method]}</Text>
                <StatusBadge status={order.payment.status} />
              </View>
              <Text tone="muted">{paymentText(order.payment)}</Text>
              {order.payment.method === "bank_transfer" && order.payment.status !== "paid" ? (
                <BankDetails />
              ) : null}
              {needsOnlinePayment ? (
                <Text variant="small" tone="warning" weight="medium">
                  Pay within 30 minutes, or the order is cancelled and its stock released.
                </Text>
              ) : null}
            </Card>
          </Section>
          <Section title="What happens next">
            <Card className="gap-2">
              {NEXT_STEPS.map((step, index) => (
                <Text key={step}>
                  {index + 1}. {step}
                </Text>
              ))}
            </Card>
          </Section>
        </>
      )}
    </Screen>
  );
}
