import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useBooking, useDeclineBooking } from "@/features/bookings/queries";
import { getDeclineReasons, OTHER_REASON } from "@/features/bookings/utils";
import { errorMessage } from "@/lib/api-client";
import { useSafeParam } from "@/lib/params";

/** Decline reason (form sheet): a one-tap reason the customer will read, or one typed in. */
export function DeclineBookingScreen() {
  const id = useSafeParam("id");
  const { data: booking } = useBooking(id);
  const decline = useDeclineBooking();
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const reason = choice === OTHER_REASON ? other.trim() : choice;
  const isReady = Boolean(reason && reason.length >= 3);

  const send = () => {
    if (!booking || !reason) return;
    // Declining can't be undone: the customer is told and the booking moves on.
    Alert.alert("Decline this booking?", `The customer will see: "${reason}".`, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: () =>
          decline.mutate(
            { id: booking.id, reason },
            {
              onSuccess: () => {
                showToast({ message: "Booking declined" });
                router.dismissTo({ pathname: "/booking/[id]", params: { id: booking.id } });
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
          Why can’t you take it?
        </Text>
        <Text variant="small" tone="muted">
          The customer sees this reason.
        </Text>
        <View accessibilityRole="radiogroup" className="mt-2">
          {(booking ? getDeclineReasons(booking) : []).map((option) => (
            <Radio
              key={option}
              label={option}
              selected={choice === option}
              onSelect={() => setChoice(option)}
            />
          ))}
        </View>
        {choice === OTHER_REASON && (
          <Input
            label="Reason"
            value={other}
            onChangeText={setOther}
            autoFocus
            maxLength={300}
            hint="At least 3 characters."
          />
        )}
      </ScrollView>
      <View className="px-4 pt-2">
        <Button
          size="main"
          variant="destructive"
          label="Decline booking"
          onPress={send}
          disabled={!isReady}
          loading={decline.isPending}
        />
      </View>
    </View>
  );
}
