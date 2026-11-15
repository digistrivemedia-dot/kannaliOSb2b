import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { StepProgress } from "@/components/ui/StepProgress";
import { Text } from "@/components/ui/Text";
import * as authApi from "@/features/auth/api";
import { getSavedApplication, saveApplication } from "@/features/auth/application-store";
import { BusinessStep } from "@/features/auth/components/BusinessStep";
import { ContactStep } from "@/features/auth/components/ContactStep";
import { ReviewStep } from "@/features/auth/components/ReviewStep";
import { useRegisterDraft } from "@/features/auth/register-draft-store";
import {
  MAX_SHOP_PHOTOS,
  REGISTER_STEPS,
  registerSchema,
  type RegisterValues,
} from "@/features/auth/schemas";
import { toRegistrationApplication } from "@/features/auth/utils";
import { applyApiErrors } from "@/lib/form-errors";
import { toDataUrls } from "@/lib/photos";

/** Registration photos may be up to 512 KB each (the backend's inline limit). */
const MAX_PHOTO_BYTES = 500 * 1024;

const ALL_FIELDS = REGISTER_STEPS.flatMap((step) => step.fields);

/**
 * G05: apply in four steps. The draft is kept on the phone as it is typed, so closing the app loses
 * nothing. Also corrects a sent-back application, or applies again after a rejection (from G06).
 */
export function RegisterScreen() {
  // Read once: the form owns the values from here, and saves them back as they change.
  const [draft] = useState(() => useRegisterDraft.getState());
  const [step, setStep] = useState(draft.step);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, setValue, trigger, subscribe, getValues, formState } =
    useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: draft.values });

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => useRegisterDraft.getState().save(values, step),
      }),
    [subscribe, step],
  );

  const goTo = (next: number) => {
    setStep(next);
    useRegisterDraft.getState().save(getValues(), next);
  };

  const next = async () => {
    const current = REGISTER_STEPS[step];
    if (current && (await trigger([...current.fields]))) goTo(step + 1);
  };

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const [photos, documents] = await Promise.all([
        toDataUrls(values.photos, MAX_PHOTO_BYTES),
        toDataUrls(values.documents, MAX_PHOTO_BYTES),
      ]);
      const application = toRegistrationApplication(values, photos, documents);
      const saved = draft.mode === "resubmit" ? await getSavedApplication() : null;
      if (draft.mode === "resubmit" && draft.ref && saved?.ref === draft.ref) {
        await authApi.resubmitApplication(draft.ref, saved.key, application);
      } else {
        const receipt = await authApi.registerBusiness(application);
        await saveApplication({ ref: receipt.referenceNumber, key: receipt.accessKey });
      }
      useRegisterDraft.getState().clear();
      router.replace("/application");
    } catch (error) {
      setFormError(applyApiErrors(error, ALL_FIELDS, setError));
    }
  });

  const isLast = step === REGISTER_STEPS.length - 1;
  const current = REGISTER_STEPS[step] ?? REGISTER_STEPS[0];

  return (
    <Screen
      header={<Header title={draft.mode === "resubmit" ? "Correct your application" : "Apply"} />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={
              isLast
                ? draft.mode === "resubmit"
                  ? "Send corrections"
                  : "Send application"
                : "Next"
            }
            onPress={isLast ? submit : () => void next()}
            loading={formState.isSubmitting}
          />
          {step > 0 && (
            <Button variant="ghost" label="Back" onPress={() => goTo(step - 1)} fullWidth />
          )}
        </BottomBar>
      }
    >
      <StepProgress step={step} total={REGISTER_STEPS.length} title={current.title} />
      {formError ? <FormAlert message={formError} /> : null}
      <View className="gap-4">
        {step === 0 && <BusinessStep control={control} setValue={setValue} />}
        {step === 1 && <ContactStep control={control} setValue={setValue} />}
        {step === 2 && (
          <>
            <Text tone="muted">
              Photos of the shop front and the workshop help Kannali verify you faster.
            </Text>
            <Controller
              control={control}
              name="photos"
              render={({ field, fieldState }) => (
                <PhotoCapture
                  label="Shop photos"
                  photos={field.value}
                  onChange={field.onChange}
                  max={MAX_SHOP_PHOTOS}
                  error={fieldState.error?.message}
                  hint="At least one, up to six."
                />
              )}
            />
          </>
        )}
        {step === 3 && <ReviewStep control={control} values={getValues()} onEdit={goTo} />}
      </View>
    </Screen>
  );
}
