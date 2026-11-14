import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import * as authApi from "@/features/auth/api";
import { saveApplication } from "@/features/auth/application-store";
import { authKeys } from "@/features/auth/queries";
import { applicationLookupSchema, type ApplicationLookupValues } from "@/features/auth/schemas";
import { errorMessage } from "@/lib/api-client";

/** Find an application by its reference and access key (both in the email sent when applying). */
export function ApplicationLookup({ onFound }: { onFound?: () => void }) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<ApplicationLookupValues>({
    resolver: zodResolver(applicationLookupSchema),
    defaultValues: { ref: "", key: "" },
  });

  const find = handleSubmit(async ({ ref, key }) => {
    setFormError(null);
    try {
      const application = await authApi.getApplication(ref, key);
      if (!application) {
        setFormError("We couldn't find that application. Check the reference and the access key.");
        return;
      }
      await saveApplication({ ref, key });
      queryClient.setQueryData(authKeys.application(ref), application);
      await queryClient.invalidateQueries({ queryKey: authKeys.savedApplication });
      onFound?.();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <Card className="gap-4">
      <Text tone="muted">
        Enter the reference and access key from the email we sent when you applied.
      </Text>
      {formError ? <FormAlert message={formError} /> : null}
      <Controller
        control={control}
        name="ref"
        render={({ field, fieldState }) => (
          <Input
            label="Reference"
            placeholder="APP-2026-0031"
            value={field.value}
            onChangeText={(text) => field.onChange(text.toUpperCase())}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        )}
      />
      <Controller
        control={control}
        name="key"
        render={({ field, fieldState }) => (
          <Input
            label="Access key"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => void find()}
          />
        )}
      />
      <Button variant="secondary" label="Find my application" onPress={find} loading={formState.isSubmitting} fullWidth />
    </Card>
  );
}
