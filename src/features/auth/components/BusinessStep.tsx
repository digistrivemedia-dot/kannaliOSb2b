import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";

import { Input } from "@/components/ui/Input";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { SelectField } from "@/components/ui/SelectField";
import { MAX_DOCUMENT_PHOTOS, type RegisterValues } from "@/features/auth/schemas";
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPES } from "@/features/company/business-types";
import { getPanFromGstin, getStateFromGstin, isValidGstin } from "@/lib/gst";

type StepProps = {
  control: Control<RegisterValues>;
  setValue: UseFormSetValue<RegisterValues>;
};

const TYPE_OPTIONS = BUSINESS_TYPES.map((type) => ({
  value: type,
  label: BUSINESS_TYPE_LABELS[type],
}));

/** Step 1: the business, with GSTIN filling in PAN (and showing the state). */
export function BusinessStep({ control, setValue }: StepProps) {
  const gstin = useWatch({ control, name: "gstin" });
  const hasValidGstin = isValidGstin(gstin);
  return (
    <>
      <Controller
        control={control}
        name="businessName"
        render={({ field, fieldState }) => (
          <Input
            label="Business name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="businessType"
        render={({ field, fieldState }) => (
          <SelectField
            label="Type of business"
            options={TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="gstin"
        render={({ field, fieldState }) => (
          <Input
            label="GSTIN (optional)"
            value={field.value}
            onChangeText={(text) => {
              const value = text.toUpperCase().replace(/\s/g, "");
              field.onChange(value);
              if (isValidGstin(value))
                setValue("pan", getPanFromGstin(value), { shouldValidate: true });
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint={
              hasValidGstin
                ? `Registered in ${getStateFromGstin(gstin)}. We've filled in your PAN.`
                : "Businesses without GST can still buy."
            }
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
          />
        )}
      />
      <Controller
        control={control}
        name="pan"
        render={({ field, fieldState }) => (
          <Input
            label="PAN (optional)"
            value={field.value}
            onChangeText={(text) => field.onChange(text.toUpperCase().replace(/\s/g, ""))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            editable={!hasValidGstin}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
          />
        )}
      />
      <Controller
        control={control}
        name="licenceNumber"
        render={({ field, fieldState }) => (
          <Input
            label="Shop or trade licence number (optional)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="characters"
          />
        )}
      />
      <Controller
        control={control}
        name="otherRegistration"
        render={({ field, fieldState }) => (
          <Input
            label="Other registration, like Udyam (optional)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="characters"
          />
        )}
      />
      <Controller
        control={control}
        name="documents"
        render={({ field, fieldState }) => (
          <PhotoCapture
            label="Licence or registration photos (optional)"
            photos={field.value}
            onChange={field.onChange}
            max={MAX_DOCUMENT_PHOTOS}
            error={fieldState.error?.message}
          />
        )}
      />
    </>
  );
}
