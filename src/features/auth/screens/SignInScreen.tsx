import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { BottomBar } from "@/components/layout/BottomBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import * as authApi from "@/features/auth/api";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { TwoFactorStep } from "@/features/auth/components/TwoFactorStep";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/store";
import type { TwoFactorChallenge } from "@/features/auth/types";
import { applyApiErrors } from "@/lib/form-errors";

/**
 * G02, minimal for Phase 1: email and password, and the 2-step code when the backend asks for it.
 * Phase 2 adds forgot password, apply, application status and first-time password.
 */
export function SignInScreen() {
  const startSession = useAuth((state) => state.startSession);
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await authApi.signIn(values);
      if (result.status === "two_factor_required") {
        setChallenge(result);
        return;
      }
      if (!result.sessionToken) {
        setFormError("This account can't sign in yet. Kannali is still reviewing the business.");
        return;
      }
      await startSession(result.sessionToken);
    } catch (error) {
      setFormError(applyApiErrors(error, ["email", "password"], setError));
    }
  });

  if (challenge) {
    return <TwoFactorStep challenge={challenge} onBack={() => setChallenge(null)} />;
  }

  return (
    <Screen
      header={<AuthHeader title="Sign in" subtitle="Use your business email and password." />}
      bottomBar={
        <BottomBar>
          <Button size="main" label="Sign in" onPress={submit} loading={formState.isSubmitting} />
        </BottomBar>
      }
    >
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
            textContentType="username"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
    </Screen>
  );
}
