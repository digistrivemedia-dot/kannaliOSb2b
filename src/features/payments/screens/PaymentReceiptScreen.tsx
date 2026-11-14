import { router } from "expo-router";
import { Share2, Wallet } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useSession } from "@/features/auth/store";
import { PAYMENT_METHOD_LABELS } from "@/features/orders/utils";
import { usePayment } from "@/features/payments/queries";
import type { Payment } from "@/features/payments/types";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { escapeHtml as e, sharePdf } from "@/lib/share-pdf";
import { statusTone } from "@/lib/status";

function receiptHtml(payment: Payment, business: string): string {
  const rows = payment.appliedTo
    .map(
      (applied) =>
        `<tr><td>${e(applied.kind === "order" ? "Order" : "Invoice")} ${e(applied.number)}</td><td style="text-align:right">${e(formatPrice(applied.amountInPaise))}</td></tr>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,Roboto,Arial,sans-serif;font-size:13px;color:#0f172a;margin:28px}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #e2e8f0;padding:6px 4px}</style></head><body>
    <h2>Payment receipt</h2><p>Kannali Garage · received from ${e(business)}</p>
    <p><strong>${e(formatPrice(payment.amountInPaise))}</strong> by ${e(PAYMENT_METHOD_LABELS[payment.method])} on ${e(formatDateTime(payment.date))}${payment.reference ? `, reference ${e(payment.reference)}` : ""}</p>
    <p>Status: ${e(statusTone(payment.status).word)}</p>
    <table>${rows}</table></body></html>`;
}

/** A payment's receipt: amount, method, reference, what it paid; Share PDF. */
export function PaymentReceiptScreen() {
  const id = useSafeParam("id");
  const query = usePayment(id);
  const { business } = useSession();
  const [isSharing, setIsSharing] = useState(false);
  const payment = query.data;

  const share = async () => {
    if (!payment) return;
    setIsSharing(true);
    await sharePdf(receiptHtml(payment, business.name), "Payment receipt");
    setIsSharing(false);
  };

  return (
    <Screen
      header={<Header title="Receipt" />}
      bottomBar={
        payment ? (
          <BottomBar>
            <Button
              size="main"
              icon={Share2}
              label="Share PDF"
              onPress={() => void share()}
              loading={isSharing}
            />
          </BottomBar>
        ) : undefined
      }
    >
      {query.isPending && id !== null ? (
        <Skeleton shape="card" className="h-40 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="this payment" />
      ) : !payment ? (
        <EmptyState
          icon={Wallet}
          title="Payment not found"
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      ) : (
        <>
          <Card className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="figure">{formatPrice(payment.amountInPaise)}</Text>
              <StatusBadge status={payment.status} />
            </View>
            <DetailRow label="Paid">{formatDateTime(payment.date)}</DetailRow>
            <DetailRow label="Method">{PAYMENT_METHOD_LABELS[payment.method]}</DetailRow>
            {payment.reference ? (
              <DetailRow label="Reference">{payment.reference}</DetailRow>
            ) : null}
          </Card>
          <Section title="Paid for">
            <Card className="gap-2">
              {payment.appliedTo.length === 0 ? (
                <Text tone="muted">Applied to your dues once Kannali confirms it.</Text>
              ) : null}
              {payment.appliedTo.map((applied) => (
                <View key={applied.id} className="flex-row justify-between">
                  <Text>
                    {applied.kind === "order" ? "Order" : "Invoice"} {applied.number}
                  </Text>
                  <Text weight="semibold" tabular>
                    {formatPrice(applied.amountInPaise)}
                  </Text>
                </View>
              ))}
            </Card>
          </Section>
        </>
      )}
    </Screen>
  );
}
