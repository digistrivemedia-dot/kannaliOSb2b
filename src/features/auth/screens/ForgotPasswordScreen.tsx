import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { MailCheck } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import * as authApi from "@/features/auth/api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";
import { applyApiErrors } from "@/lib/form-errors";

/** G03: the email to send a reset link to, then "Check your email". */
export function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: typeof params.email === "string" ? params.email : "" },
  });

  const submit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await authApi.requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      setFormError(applyApiErrors(error, ["email"], setError));
    }
  });

  if (sentTo) {
    return (
      <Screen
        header={<Header title="Check your email" />}
        bottomBar={
          <BottomBar>
            <Button size="main" label="I have the link" onPress={() => router.replace("/set-password")} />
            <Button variant="ghost" label="Back to sign in" onPress={() => router.back()} fullWidth />
          </BottomBar>
        }
      >
        <EmptyState
          icon={MailCheck}
          title="Check your email"
          message={`If ${sentTo} has a login, a link to set a new password is on its way. It works once and for a short time.`}
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={<Header title="Forgot password" />}
      bottomBar={
        <BottomBar>
          <Button size="main" label="Send reset link" onPress={submit} loading={formState.isSubmitting} />
        </BottomBar>
      }
    >
      <Text tone="muted">Enter your business email. We'll send you a link to set a new password.</Text>
      {formError ? <FormAlert message={formError} /> : null}
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Input
            label="Business email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
    </Screen>
  );
}
