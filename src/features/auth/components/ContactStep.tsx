import { useEffect, type ComponentProps } from "react";
import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";

import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import type { RegisterValues } from "@/features/auth/schemas";
import { usePincode } from "@/features/company/queries";

type StepProps = {
  control: Control<RegisterValues>;
  setValue: UseFormSetValue<RegisterValues>;
};

/** Step 2: who to contact and where the business is. A known PIN fills in city and state. */
export function ContactStep({ control, setValue }: StepProps) {
  const pin = useWatch({ control, name: "pin" });
  const place = usePincode(pin);

  useEffect(() => {
    if (!place.data) return;
    setValue("city", place.data.city, { shouldValidate: true });
    setValue("state", place.data.state, { shouldValidate: true });
  }, [place.data, setValue]);

  const text = (
    name: "contactName" | "email" | "addressLine1" | "addressLine2" | "city" | "state",
    label: string,
    extra: Partial<ComponentProps<typeof Input>> = {},
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...extra}
        />
      )}
    />
  );

  return (
    <>
      {text("contactName", "Contact person (if not you, optional)", { autoCapitalize: "words" })}
      {text("email", "Business email", {
        keyboardType: "email-address",
        autoCapitalize: "none",
        autoCorrect: false,
        autoComplete: "email",
        hint: "Your login details come to this email once you're approved.",
      })}
      <Controller
        control={control}
        name="mobile"
        render={({ field, fieldState }) => (
          <NumberInput
            label="Mobile number"
            prefix="+91"
            value={field.value}
            onChangeText={(value) => field.onChange(value.slice(0, 10))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoComplete="tel"
          />
        )}
      />
      {text("addressLine1", "Building and street", { autoCapitalize: "words" })}
      {text("addressLine2", "Area (optional)", { autoCapitalize: "words" })}
      <Controller
        control={control}
        name="pin"
        render={({ field, fieldState }) => (
          <NumberInput
            label="PIN code"
            value={field.value}
            onChangeText={(value) => field.onChange(value.slice(0, 6))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint={place.isFetching ? "Looking up the PIN…" : undefined}
          />
        )}
      />
      {text("city", "City", { autoCapitalize: "words" })}
      {text("state", "State", { autoCapitalize: "words" })}
    </>
  );
}
