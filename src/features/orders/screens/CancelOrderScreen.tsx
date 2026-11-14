import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useCancelOrder } from "@/features/orders/queries";
import type { CancellationReason } from "@/features/orders/types";
import { CANCEL_REASONS } from "@/features/orders/utils";
import { errorMessage } from "@/lib/api-client";
import { useSafeParam } from "@/lib/params";

const REASONS = Object.keys(CANCEL_REASONS) as CancellationReason[];

/** Cancel an order until it ships (form sheet): a reason, then a confirm, as it can't be undone. */
export function CancelOrderScreen() {
  const id = useSafeParam("id");
  const cancel = useCancelOrder(id ?? "");
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<CancellationReason | null>(null);
  const [note, setNote] = useState("");

  const confirm = () => {
    if (!reason) return;
    Alert.alert("Cancel this order?", "It can't be undone. Anything paid is refunded.", [
      { text: "Keep the order", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: () =>
          cancel.mutate(
            { reason, note: note.trim() || undefined },
            {
              onSuccess: () => {
                showToast({ message: "Order cancelled" });
                router.back();
              },
              onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
            },
          ),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView contentContainerClassName="gap-2 px-4 pt-6" keyboardShouldPersistTaps="handled">
        <Text variant="heading" accessibilityRole="header">
          Why are you cancelling?
        </Text>
        <View accessibilityRole="radiogroup" className="mt-2">
          {REASONS.map((value) => (
            <Radio
              key={value}
              label={CANCEL_REASONS[value]}
              selected={reason === value}
              onSelect={() => setReason(value)}
            />
          ))}
        </View>
        <Input
          label="Anything to add (optional)"
          value={note}
          onChangeText={setNote}
          maxLength={300}
        />
      </ScrollView>
      <View className="px-4 pt-2">
        <Button
          size="main"
          variant="destructive"
          label="Cancel order"
          onPress={confirm}
          disabled={!reason}
          loading={cancel.isPending}
        />
      </View>
    </View>
  );
}
