import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { SelectField } from "@/components/ui/SelectField";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useSession } from "@/features/auth/store";
import { useCan } from "@/features/auth/use-can";
import { OrderTotals } from "@/features/cart/components/OrderTotals";
import { useCart } from "@/features/cart/store";
import { useCartLines, useDeliveryRule } from "@/features/cart/use-cart-lines";
import { BankDetails } from "@/features/checkout/components/BankDetails";
import { useBranches } from "@/features/company/queries";
import { useCreditSummary } from "@/features/credit/queries";
import { usePlaceOrder } from "@/features/orders/queries";
import type { PlaceOrderRequest } from "@/features/orders/types";
import { useQuotation } from "@/features/quotations/queries";
import { errorMessage } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { calculateOrderTotals } from "@/lib/pricing";

type Method = "razorpay" | "bank_transfer" | "credit";

/**
 * G55: where to deliver, PO number, how to pay (online, bank transfer, or credit when Kannali enabled
 * it), the totals, then Place order. With `?quotation=` it orders that quotation at its quoted prices.
 */
export function CheckoutScreen() {
  const params = useLocalSearchParams<{ quotation?: string }>();
  const quotationId =
    typeof params.quotation === "string" && /^[\w-]+$/.test(params.quotation)
      ? params.quotation
      : null;
  const { business } = useSession();
  const branches = useBranches();
  const cart = useCartLines();
  const rule = useDeliveryRule();
  const setBranch = useCart((state) => state.setBranch);
  const quotation = useQuotation(quotationId);
  const canSeeCredit = useCan("credit:view");
  const credit = useCreditSummary({ enabled: business.creditEnabled && canSeeCredit });
  const place = usePlaceOrder();
  const [method, setMethod] = useState<Method>("razorpay");
  const [poNumber, setPoNumber] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  const quoted = quotation.data;
  const totals = quoted
    ? calculateOrderTotals(
        quoted.items.map((item) => ({
          quantity: item.quantity,
          unitPriceInPaise: item.quotedPriceInPaise ?? item.listPriceInPaise,
          listPriceInPaise: item.listPriceInPaise,
          gstRatePercent: item.gstRatePercent,
        })),
        rule,
      )
    : cart.totals;
  const branchId = quoted ? quoted.branch.id : cart.branchId;
  const creditShort = credit.data ? credit.data.availableInPaise < totals.totalInPaise : false;
  const creditOverdue = (credit.data?.overdueInvoiceCount ?? 0) > 0;
  const creditReason = creditOverdue
    ? "Pay your overdue invoices first."
    : creditShort
      ? `Only ${formatPrice(credit.data?.availableInPaise ?? 0)} of credit left.`
      : null;

  const submit = () => {
    setError(null);
    const payment: PlaceOrderRequest["payment"] =
      method === "razorpay"
        ? { method, channel: "upi" }
        : method === "bank_transfer"
          ? { method, transferReference: reference.trim() || undefined }
          : { method };
    place.mutate(
      {
        ...(quoted ? { quotationId: quoted.id } : {}),
        branchId,
        poNumber: poNumber.trim() || undefined,
        payment,
        items: quoted
          ? []
          : cart.lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
      },
      {
        onSuccess: (order) => {
          if (!quoted) useCart.getState().clear();
          router.replace({ pathname: "/order-placed/[id]", params: { id: order.id } });
        },
        onError: (failure) => setError(errorMessage(failure)),
      },
    );
  };

  const isLoading = quotationId ? quotation.isPending : cart.isPending;

  return (
    <Screen
      header={
        <Header title="Checkout" subtitle={quoted ? `Quotation ${quoted.number}` : undefined} />
      }
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={`Place order · ${formatPrice(totals.totalInPaise)}`}
            onPress={submit}
            loading={place.isPending}
            disabled={
              isLoading ||
              (method === "credit" && creditReason !== null) ||
              (!quoted && (cart.lines.length === 0 || cart.isBlocked))
            }
          />
        </BottomBar>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      <Section title="Deliver to">
        {quoted ? (
          <Card>
            <Text weight="semibold">{quoted.branch.name}</Text>
            <Text variant="small" tone="muted">
              The branch the quotation was asked for.
            </Text>
          </Card>
        ) : (
          <SelectField
            label="Branch"
            options={(branches.data ?? []).map((branch) => ({
              value: branch.id,
              label: branch.name,
              description: [branch.address.line1, branch.address.city, branch.address.pin].join(
                ", ",
              ),
            }))}
            value={branchId}
            onChange={setBranch}
          />
        )}
      </Section>
      <Input
        label="Your PO number (optional)"
        value={poNumber}
        onChangeText={setPoNumber}
        autoCapitalize="characters"
      />
      <Section title="Payment">
        <View accessibilityRole="radiogroup">
          <Radio
            label="Online"
            description="UPI, net banking or card (a demo payment until Razorpay is connected)"
            selected={method === "razorpay"}
            onSelect={() => setMethod("razorpay")}
          />
          <Radio
            label="Bank transfer"
            description="Kannali confirms when the money arrives"
            selected={method === "bank_transfer"}
            onSelect={() => setMethod("bank_transfer")}
          />
          {business.creditEnabled && (
            <Radio
              label="On credit"
              description={
                creditReason ??
                (credit.data
                  ? `${formatPrice(credit.data.availableInPaise)} available, ${credit.data.termsDays} days to pay`
                  : "Invoiced when it ships")
              }
              selected={method === "credit"}
              onSelect={() => setMethod("credit")}
              disabled={creditReason !== null}
            />
          )}
        </View>
        {method === "bank_transfer" && (
          <Card className="gap-3">
            <BankDetails />
            <Input
              label="Transfer reference, if you've paid (optional)"
              value={reference}
              onChangeText={setReference}
              autoCapitalize="characters"
              hint="The UTR from your bank. You can also pay after placing the order."
            />
          </Card>
        )}
      </Section>
      <Card>
        {isLoading ? <Skeleton className="h-24 w-full" /> : <OrderTotals totals={totals} />}
      </Card>
    </Screen>
  );
}
