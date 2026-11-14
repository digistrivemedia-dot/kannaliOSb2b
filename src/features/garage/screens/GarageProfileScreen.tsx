import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { HolidaysField } from "@/features/garage/components/HolidaysField";
import { OpeningHoursField } from "@/features/garage/components/OpeningHoursField";
import { ServicesField } from "@/features/garage/components/ServicesField";
import { useGarageProfile, useSaveGarageProfile } from "@/features/garage/queries";
import {
  garageProfileSchema,
  MAX_GARAGE_PHOTO_BYTES,
  MAX_GARAGE_PHOTOS,
  type GarageProfileValues,
} from "@/features/garage/schemas";
import type { GarageProfile } from "@/features/garage/types";
import { toGarageProfile, toProfileValues } from "@/features/garage/utils";
import { VEHICLE_TYPES } from "@/features/jobs/schemas";
import { VEHICLE_TYPE_LABELS } from "@/features/jobs/utils";
import { clearDraft, savedDraft, useFormDraft } from "@/lib/drafts";
import { applyApiErrors } from "@/lib/form-errors";
import { toDataUrls } from "@/lib/photos";

const DRAFT_KEY = "garage-profile";

/** G81 (owners): how the garage appears to customers booking it. One profile for every branch. */
export function GarageProfileScreen() {
  const profile = useGarageProfile();
  if (profile.isPending) {
    return (
      <Screen header={<Header title="Garage profile" />}>
        <Skeleton shape="card" className="h-40 w-full" />
        <Skeleton shape="card" className="h-64 w-full" />
      </Screen>
    );
  }
  if (profile.isError) {
    return (
      <Screen header={<Header title="Garage profile" />}>
        <ErrorState
          error={profile.error}
          onRetry={() => void profile.refetch()}
          what="your garage profile"
        />
      </Screen>
    );
  }
  return <ProfileForm profile={profile.data} />;
}

function ProfileForm({ profile }: { profile: GarageProfile }) {
  const save = useSaveGarageProfile();
  const [isPreparing, setIsPreparing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<GarageProfileValues>({
    resolver: zodResolver(garageProfileSchema),
    defaultValues: savedDraft<GarageProfileValues>(DRAFT_KEY) ?? toProfileValues(profile),
  });
  useFormDraft(DRAFT_KEY, form);
  const { control, handleSubmit, setError, formState } = form;
  const offersPickup = useWatch({ control, name: "pickupDrop.isOffered" });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setIsPreparing(true);
    try {
      const photos = await toDataUrls(values.photos, MAX_GARAGE_PHOTO_BYTES);
      save.mutate(
        { ...toGarageProfile(values), photos },
        {
          onSuccess: (saved) => {
            clearDraft(DRAFT_KEY);
            form.reset(toProfileValues(saved));
            showToast({ message: "Garage profile saved" });
          },
          onError: (error) =>
            setFormError(
              applyApiErrors(
                error,
                ["about", "photos", "services", "vehicleTypes", "dailyBookingLimit"],
                setError,
              ),
            ),
        },
      );
    } catch {
      setFormError("A photo couldn't be prepared. Remove it and take it again.");
    } finally {
      setIsPreparing(false);
    }
  });

  const hasErrors = formState.isSubmitted && Object.keys(formState.errors).length > 0;

  return (
    <Screen
      header={<Header title="Garage profile" subtitle="What customers see when they book" />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label="Save profile"
            onPress={submit}
            loading={isPreparing || save.isPending}
          />
        </BottomBar>
      }
    >
      {formError ? <FormAlert message={formError} /> : null}
      {hasErrors && !formError ? (
        <FormAlert message="Some details need fixing. They're marked below." />
      ) : null}
      <Section title="Photos and about">
        <Controller
          control={control}
          name="photos"
          render={({ field, fieldState }) => (
            <PhotoCapture
              label="Garage photos"
              photos={field.value}
              onChange={field.onChange}
              max={MAX_GARAGE_PHOTOS}
              hint="The front, the workshop floor and the waiting area."
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="about"
          render={({ field, fieldState }) => (
            <Input
              label="About the garage"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              multiline
              hint={`${field.value.length} of 600 characters`}
            />
          )}
        />
      </Section>
      <Section title="Services and prices">
        <ServicesField
          control={control}
          error={formState.errors.services?.root?.message ?? formState.errors.services?.message}
        />
      </Section>
      <Section title="Vehicles you service">
        <Controller
          control={control}
          name="vehicleTypes"
          render={({ field, fieldState }) => (
            <View className="gap-2">
              <View className="flex-row flex-wrap gap-2" accessibilityLabel="Vehicle types">
                {VEHICLE_TYPES.map((type) => {
                  const selected = field.value.includes(type);
                  return (
                    <Chip
                      key={type}
                      label={VEHICLE_TYPE_LABELS[type]}
                      selected={selected}
                      onPress={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((value) => value !== type)
                            : [...field.value, type],
                        )
                      }
                    />
                  );
                })}
              </View>
              {fieldState.error ? (
                <Text variant="small" tone="danger">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />
      </Section>
      <Section title="Opening hours">
        <OpeningHoursField control={control} />
        <Controller
          control={control}
          name="dailyBookingLimit"
          render={({ field, fieldState }) => (
            <NumberInput
              label="Bookings a day, per branch"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </Section>
      <Section title="Holidays">
        <HolidaysField control={control} />
      </Section>
      <Section title="Pick-up and drop">
        <Controller
          control={control}
          name="pickupDrop.isOffered"
          render={({ field }) => (
            <Switch
              label="Offer pick-up and drop"
              description="A driver collects the vehicle and brings it back."
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {offersPickup ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="pickupDrop.fee"
                render={({ field, fieldState }) => (
                  <NumberInput
                    decimals
                    label="Fee, excl. GST"
                    prefix="₹"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="pickupDrop.radiusKm"
                render={({ field, fieldState }) => (
                  <NumberInput
                    label="Up to"
                    suffix="km"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
          </View>
        ) : null}
      </Section>
    </Screen>
  );
}
