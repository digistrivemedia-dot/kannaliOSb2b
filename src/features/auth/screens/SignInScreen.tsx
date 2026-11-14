import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Building2, FileSearch, KeyRound } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { ListRow } from "@/components/ui/ListRow";
import { PasswordInput } from "@/components/ui/PasswordInput";
import * as authApi from "@/features/auth/api";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { TwoFactorStep } from "@/features/auth/components/TwoFactorStep";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/store";
import type { TwoFactorChallenge } from "@/features/auth/types";
import { applyApiErrors } from "@/lib/form-errors";

/** G02: business email and password, the 2-step code when asked, and the ways in for everyone else. */
export function SignInScreen() {
  const startSession = useAuth((state) => state.startSession);
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState, getValues } = useForm<SignInValues>({
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
      if (result.mustSetPassword || !result.sessionToken) {
        // Logins exist only for approved businesses, and a first password comes from the invite link.
        setFormError("Set your password from the invite link we emailed you first.");
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
      <View className="gap-4">
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
        <Button
          variant="ghost"
          label="Forgot password?"
          onPress={() =>
            router.push({ pathname: "/forgot-password", params: { email: getValues("email") } })
          }
        />
      </View>
      <Card flush>
        <ListRow
          icon={KeyRound}
          title="Have an invite or reset link?"
          subtitle="Set your password"
          onPress={() => router.push("/set-password")}
        />
        <ListRow
          icon={Building2}
          title="New business? Apply"
          subtitle="Garages, dealers, fleets and retailers"
          onPress={() => router.push("/register")}
          divided
        />
        <ListRow
          icon={FileSearch}
          title="Check your application"
          subtitle="For businesses that have applied"
          onPress={() => router.push("/application")}
          divided
        />
      </Card>
    </Screen>
  );
}
