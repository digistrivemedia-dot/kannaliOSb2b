import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { CircleCheckBig } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Text } from "@/components/ui/Text";
import * as authApi from "@/features/auth/api";
import { PasswordRules } from "@/features/auth/components/PasswordRules";
import { newPasswordSchema, type NewPasswordValues } from "@/features/auth/schemas";
import { tokenFromLink } from "@/features/auth/utils";
import { ApiError } from "@/lib/api-client";
import { applyApiErrors } from "@/lib/form-errors";

/**
 * G04: a new password from an invite or reset link. Opened from the link (Phase 10), or with the link
 * pasted in, as in Expo Go the link prints in the backend's terminal.
 */
export function SetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const fromLink = typeof params.token === "string" ? params.token : "";
  const [isDone, setIsDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { token: fromLink, password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.setPassword(values.password, tokenFromLink(values.token));
      setIsDone(true);
    } catch (error) {
      if (error instanceof ApiError && error.code === "RESET_TOKEN_INVALID") {
        setFormError("This link has been used or has run out. Ask for a new one from Forgot password.");
        return;
      }
      setFormError(applyApiErrors(error, ["password"], setError));
    }
  });

  if (isDone) {
    return (
      <Screen
        header={<Header title="Password set" showBack={false} />}
        bottomBar={
          <BottomBar>
            <Button size="main" label="Sign in" onPress={() => router.replace("/sign-in")} />
          </BottomBar>
        }
      >
        <EmptyState
          icon={CircleCheckBig}
          title="Your password is set"
          message="Sign in with your business email and the new password."
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={<Header title="Set your password" />}
      bottomBar={
        <BottomBar>
          <Button size="main" label="Set password" onPress={submit} loading={formState.isSubmitting} />
        </BottomBar>
      }
    >
      {formError ? <FormAlert message={formError} /> : null}
      {!fromLink && (
        <>
          <Text tone="muted">Paste the link from your invite or reset email.</Text>
          <Controller
            control={control}
            name="token"
            render={({ field, fieldState }) => (
              <Input
                label="Link from the email"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://…/set-password?token=…"
              />
            )}
          />
        </>
      )}
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            label="New password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}
      />
      <PasswordRules password={password} />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <PasswordInput
            label="Type it again"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
    </Screen>
  );
}
