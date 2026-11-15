import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { BankDetails } from "@/features/checkout/components/BankDetails";
import { useCreditInvoices, usePayInvoices } from "@/features/credit/queries";
import { payDuesSchema } from "@/features/credit/schemas";
import { errorMessage } from "@/lib/api-client";
import { formatDate, formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { firstProblem } from "@/lib/validation";

/**
 * G71 (form sheet): pick invoices (or oldest first), the total, and pay. Bank transfers wait for Kannali to
 * confirm. Online needs Razorpay's window (Phase 10): the backend has no demo payment for dues (BN-12).
 */
export function PayDuesScreen() {
  const invoiceId = useSafeParam("invoice");
  const dues = useCreditInvoices("unpaid");
  const pay = usePayInvoices();
  const insets = useSafeAreaInsets();
  const invoices = [...(dues.data ?? [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const [picked, setPicked] = useState<Set<string>>(() => new Set(invoiceId ? [invoiceId] : []));
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chosen = invoices.filter((invoice) => picked.has(invoice.id));
  const total = chosen.reduce((sum, invoice) => sum + invoice.balanceInPaise, 0);

  const toggle = (id: string, isOn: boolean) =>
    setPicked((current) => {
      const next = new Set(current);
      if (isOn) next.add(id);
      else next.delete(id);
      return next;
    });

  const submit = () => {
    const problem = firstProblem(payDuesSchema, {
      invoiceIds: chosen.map((invoice) => invoice.id),
      reference,
    });
    setError(problem);
    if (problem) return;
    pay.mutate(
      {
        invoiceIds: chosen.map((invoice) => invoice.id),
        payment: { method: "bank_transfer", transferReference: reference.trim() },
      },
      {
        onSuccess: () => {
          showToast({
            message: `${formatPrice(total)} recorded. Kannali confirms it when the money arrives.`,
          });
          router.back();
        },
        onError: (failure) => setError(errorMessage(failure)),
      },
    );
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView contentContainerClassName="gap-4 px-4 pt-6" keyboardShouldPersistTaps="handled">
        <Text variant="heading" accessibilityRole="header">
          Pay dues
        </Text>
        {error ? <FormAlert message={error} /> : null}
        <View className="flex-row items-center justify-between">
          <Text variant="label" tone="muted" sectionLabel>
            Invoices
          </Text>
          <Button
            variant="ghost"
            label="Oldest first, all"
            onPress={() => setPicked(new Set(invoices.map((invoice) => invoice.id)))}
          />
        </View>
        <View>
          {invoices.map((invoice) => (
            <Checkbox
              key={invoice.id}
              label={`${invoice.number} · ${formatPrice(invoice.balanceInPaise)}`}
              description={`${invoice.status === "overdue" ? "Overdue since" : "Due"} ${formatDate(invoice.dueDate)}`}
              checked={picked.has(invoice.id)}
              onChange={(isOn) => toggle(invoice.id, isOn)}
            />
          ))}
        </View>
        <View accessibilityRole="radiogroup">
          <Radio
            label="Bank transfer"
            description="Send the money, then enter its UTR"
            selected
            onSelect={() => undefined}
          />
          <Radio
            label="Online"
            description="Opens with Razorpay in the next app release"
            selected={false}
            onSelect={() => undefined}
            disabled
          />
        </View>
        <BankDetails />
        <Input
          label="UTR of your transfer"
          value={reference}
          onChangeText={setReference}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </ScrollView>
      <View className="px-4 pt-2">
        <Button
          size="main"
          label={`Record payment · ${formatPrice(total)}`}
          onPress={submit}
          disabled={chosen.length === 0}
          loading={pay.isPending}
        />
      </View>
    </View>
  );
}
