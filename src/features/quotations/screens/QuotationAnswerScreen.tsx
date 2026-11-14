import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useAnswerQuotation } from "@/features/quotations/queries";
import { errorMessage } from "@/lib/api-client";
import { useSafeParam } from "@/lib/params";

/** Reject a quotation (with a confirm: it can't be undone) or ask for a revision with a comment (form sheet). */
export function QuotationAnswerScreen() {
  const id = useSafeParam("id");
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind = params.kind === "reject" ? "reject" : "revision";
  const answer = useAnswerQuotation(id ?? "");
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const isReady = kind === "reject" || text.trim().length >= 3;

  const send = () =>
    answer.mutate(
      { kind, text: text.trim() },
      {
        onSuccess: () => {
          showToast({
            message:
              kind === "reject" ? "Quotation rejected" : "Sent back to Kannali for a revision",
          });
          router.back();
        },
        onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
      },
    );

  const submit = () => {
    if (kind === "revision") return send();
    Alert.alert("Reject this quotation?", "It can't be undone. You can always ask for a new one.", [
      { text: "Keep it", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: send },
    ]);
  };

  return (
    <View
      className="flex-1 gap-3 bg-white px-4 pt-6"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <Text variant="heading" accessibilityRole="header">
        {kind === "reject" ? "Reject the quotation" : "Ask for a revision"}
      </Text>
      <Input
        label={kind === "reject" ? "Why (optional)" : "What should change?"}
        placeholder={
          kind === "reject"
            ? "Found a better price"
            : "Can you do better on the batteries for 20 units?"
        }
        value={text}
        onChangeText={setText}
        multiline
        maxLength={kind === "reject" ? 500 : 1000}
        autoFocus
      />
      <View className="flex-1" />
      <Button
        size="main"
        variant={kind === "reject" ? "destructive" : "primary"}
        label={kind === "reject" ? "Reject quotation" : "Send for revision"}
        onPress={submit}
        disabled={!isReady}
        loading={answer.isPending}
      />
    </View>
  );
}
