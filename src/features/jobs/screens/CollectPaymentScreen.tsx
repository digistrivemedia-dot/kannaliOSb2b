import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useCollectPayment, useJobCard } from "@/features/jobs/queries";
import { collectPaymentSchema } from "@/features/jobs/schemas";
import { errorMessage } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { firstProblem } from "@/lib/validation";

/**
 * How the customer pays (CLAUDE.md §8): online (a payment link or UPI to the garage), or at the counter in
 * cash or by scanning the garage's UPI. UPI at the counter is an online payment with its reference.
 */
type Way = "online" | "counter_upi" | "cash";

const WAYS: { value: Way; label: string; description: string }[] = [
  {
    value: "online",
    label: "Online",
    description: "Payment link or UPI from the customer's phone",
  },
  {
    value: "counter_upi",
    label: "Garage's UPI at the counter",
    description: "The customer scans your QR",
  },
  { value: "cash", label: "Cash at the counter", description: "The change to give is shown" },
];

/** G43 (form sheet): the amount due and how it was paid; then the job is Paid. */
export function CollectPaymentScreen() {
  const id = useSafeParam("id");
  const { data: job } = useJobCard(id);
  const collect = useCollectPayment(id ?? "");
  const insets = useSafeAreaInsets();
  const [way, setWay] = useState<Way>("online");
  const [reference, setReference] = useState("");
  const [cash, setCash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const due = job?.invoice?.totalInPaise ?? 0;
  const cashInPaise = Math.round(Number(cash || 0) * 100);
  const change = cashInPaise - due;

  const save = () => {
    const problem = firstProblem(collectPaymentSchema(due), { way, cashInPaise, reference });
    setError(problem);
    if (problem) return;
    collect.mutate(
      way === "cash"
        ? { method: "cash", cashReceivedInPaise: cashInPaise }
        : { method: "online", reference: reference.trim() },
      {
        onSuccess: () => {
          showToast({ message: `${formatPrice(due)} received. Hand the vehicle over next.` });
          router.back();
        },
        onError: (failure) => setError(errorMessage(failure)),
      },
    );
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView contentContainerClassName="gap-4 px-4 pt-6" keyboardShouldPersistTaps="handled">
        <View>
          <Text variant="label" tone="muted" sectionLabel>
            Amount due, incl. GST
          </Text>
          <Text variant="figure">{formatPrice(due)}</Text>
        </View>
        {error ? <FormAlert message={error} /> : null}
        <View accessibilityRole="radiogroup">
          {WAYS.map((option) => (
            <Radio
              key={option.value}
              label={option.label}
              description={option.description}
              selected={way === option.value}
              onSelect={() => setWay(option.value)}
            />
          ))}
        </View>
        {way === "cash" ? (
          <View className="gap-1">
            <NumberInput
              label="Cash received"
              prefix="₹"
              decimals
              value={cash}
              onChangeText={setCash}
              autoFocus
            />
            {cash && change >= 0 ? (
              <Text weight="semibold" tone="success">
                Give back {formatPrice(change)}
              </Text>
            ) : null}
          </View>
        ) : (
          <Input
            label="UPI or payment reference"
            value={reference}
            onChangeText={setReference}
            autoCapitalize="characters"
            autoCorrect={false}
            hint="From the payment message on the customer's phone."
          />
        )}
      </ScrollView>
      <View className="px-4 pt-2">
        <Button
          size="main"
          label="Mark as paid"
          onPress={save}
          loading={collect.isPending}
          disabled={!job?.invoice}
        />
      </View>
    </View>
  );
}
