import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useRespondToJob } from "@/features/jobs/queries";
import { errorMessage } from "@/lib/api-client";
import { useSafeParam } from "@/lib/params";

const REASONS = [
  "Too many jobs on now",
  "Not trained for this work",
  "On leave or going off shift",
  "Other",
];

/** A technician hands an assigned job back to the desk, with a reason (form sheet). */
export function DeclineAssignmentScreen() {
  const id = useSafeParam("id");
  const respond = useRespondToJob(id ?? "");
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const reason = choice === "Other" ? other.trim() : choice;

  const send = () => {
    if (!reason || reason.length < 3) return;
    respond.mutate(
      { accept: false, reason },
      {
        onSuccess: () => {
          showToast({ message: "Handed back to the desk" });
          router.dismissTo("/my-jobs");
        },
        onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
      },
    );
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView contentContainerClassName="gap-2 px-4 pt-6" keyboardShouldPersistTaps="handled">
        <Text variant="heading" accessibilityRole="header">
          Why can’t you take it?
        </Text>
        <Text variant="small" tone="muted">
          The desk sees this and assigns someone else.
        </Text>
        <View accessibilityRole="radiogroup" className="mt-2">
          {REASONS.map((option) => (
            <Radio
              key={option}
              label={option}
              selected={choice === option}
              onSelect={() => setChoice(option)}
            />
          ))}
        </View>
        {choice === "Other" && (
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
          label="Hand it back"
          onPress={send}
          disabled={!reason || reason.length < 3}
          loading={respond.isPending}
        />
      </View>
    </View>
  );
}
