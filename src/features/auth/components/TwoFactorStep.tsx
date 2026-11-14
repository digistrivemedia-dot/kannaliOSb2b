import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { BottomBar } from "@/components/layout/BottomBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { NumberInput } from "@/components/ui/NumberInput";
import * as authApi from "@/features/auth/api";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { twoFactorSchema, type TwoFactorValues } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/store";
import type { TwoFactorChallenge } from "@/features/auth/types";
import { applyApiErrors } from "@/lib/form-errors";

type TwoFactorStepProps = {
  challenge: TwoFactorChallenge;
  /** Back to email and password, e.g. to use another account. */
  onBack: () => void;
};

/** The 2-step code the backend sent by SMS (in development it prints in the backend's terminal). */
export function TwoFactorStep({ challenge, onBack }: TwoFactorStepProps) {
  const startSession = useAuth((state) => state.startSession);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<TwoFactorValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: "" },
  });

  const verify = handleSubmit(async ({ code }) => {
    setFormError(null);
    try {
      const { sessionToken } = await authApi.verifyTwoFactor(challenge.challengeId, code);
      await startSession(sessionToken);
    } catch (error) {
      setFormError(applyApiErrors(error, ["code"], setError));
    }
  });

  return (
    <Screen
      header={
        <AuthHeader
          title="Enter the code"
          subtitle={`We sent a 6-digit code to ${challenge.maskedPhone}.`}
        />
      }
      bottomBar={
        <BottomBar>
          <Button size="main" label="Verify and sign in" onPress={verify} loading={formState.isSubmitting} />
          <Button variant="ghost" label="Use another account" onPress={onBack} fullWidth />
        </BottomBar>
      }
    >
      {formError ? <FormAlert message={formError} /> : null}
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <NumberInput
            label="6-digit code"
            value={field.value}
            onChangeText={(value) => field.onChange(value.slice(0, 6))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoFocus
            onSubmitEditing={() => void verify()}
          />
        )}
      />
    </Screen>
  );
}
