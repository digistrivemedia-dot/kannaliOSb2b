import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { FileQuestion } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormAlert } from "@/components/ui/FormAlert";
import { NumberInput } from "@/components/ui/NumberInput";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { PlateChip } from "@/components/ui/PlateChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { ComplaintsField } from "@/features/jobs/components/ComplaintsField";
import { DamageNotesField } from "@/features/jobs/components/DamageNotesField";
import { FuelLevelPicker } from "@/features/jobs/components/FuelLevelPicker";
import { useCheckIn, useJobCard } from "@/features/jobs/queries";
import { checkInSchema, type CheckInValues } from "@/features/jobs/schemas";
import type { JobCard } from "@/features/jobs/types";
import { MAX_JOB_PHOTO_BYTES, vehicleName } from "@/features/jobs/utils";
import { clearDraft, savedDraft, useFormDraft } from "@/lib/drafts";
import { applyApiErrors } from "@/lib/form-errors";
import { useSafeParam } from "@/lib/params";
import { toDataUrls } from "@/lib/photos";

/** G33: how the vehicle came in. Saving opens the job card for inspection. */
export function CheckInScreen() {
  const id = useSafeParam("id");
  const query = useJobCard(id);
  const job = query.data;
  return (
    <>
      {query.isPending && id !== null ? (
        <Screen header={<Header title="Check-in" />}>
          <View accessible accessibilityLabel="Loading" className="gap-4">
            <Skeleton shape="card" className="h-24 w-full" />
            <Skeleton shape="card" className="h-40 w-full" />
          </View>
        </Screen>
      ) : !job ? (
        <Screen header={<Header title="Check-in" />}>
          {query.isError ? (
            <ErrorState
              error={query.error}
              onRetry={() => void query.refetch()}
              what="this job card"
            />
          ) : (
            <EmptyState
              icon={FileQuestion}
              title="Job card not found"
              action={{ label: "Go back", onPress: () => router.back() }}
            />
          )}
        </Screen>
      ) : (
        <CheckInForm job={job} />
      )}
    </>
  );
}

function CheckInForm({ job }: { job: JobCard }) {
  const isPickup = job.status === "out_for_pickup";
  const draftKey = `check-in:${job.id}`;
  const form = useForm<CheckInValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: savedDraft<CheckInValues>(draftKey) ?? {
      odometerKm: "",
      fuelLevel: "half",
      complaints: job.complaints.length ? job.complaints.map((text) => ({ text })) : [{ text: "" }],
      damages: [],
      photos: [],
    },
  });
  useFormDraft(draftKey, form);
  const { control, handleSubmit, setError, formState } = form;
  const checkIn = useCheckIn(job.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const save = handleSubmit(async (values) => {
    setFormError(null);
    setIsPreparing(true);
    try {
      const [photos, damages] = await Promise.all([
        toDataUrls(values.photos, MAX_JOB_PHOTO_BYTES),
        Promise.all(
          values.damages.map(async (damage) => ({
            ...damage,
            photos: await toDataUrls(damage.photos, MAX_JOB_PHOTO_BYTES),
          })),
        ),
      ]);
      await checkIn.mutateAsync({
        odometerKm: Number(values.odometerKm),
        fuelLevel: values.fuelLevel,
        complaints: values.complaints.map((item) => item.text).filter(Boolean),
        damages,
        photos,
      });
      clearDraft(draftKey);
      showToast({ message: isPickup ? "Picked up. Bring it to the garage." : "Job card created" });
      router.back();
    } catch (error) {
      setFormError(applyApiErrors(error, ["odometerKm", "fuelLevel", "photos"], setError));
    } finally {
      setIsPreparing(false);
    }
  });

  return (
    <Screen
      header={
        <Header title={isPickup ? "Record pick-up" : "Check-in"} subtitle={`Job ${job.number}`} />
      }
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={isPickup ? "Picked up" : "Create job card"}
            onPress={save}
            loading={isPreparing || checkIn.isPending || formState.isSubmitting}
          />
        </BottomBar>
      }
    >
      <View className="flex-row items-center gap-3">
        <PlateChip plate={job.vehicle.plate} />
        <Text weight="semibold" className="flex-1" numberOfLines={1}>
          {vehicleName(job.vehicle)}
        </Text>
      </View>
      {formError ? <FormAlert message={formError} /> : null}
      <Controller
        control={control}
        name="odometerKm"
        render={({ field, fieldState }) => (
          <NumberInput
            label="Odometer"
            suffix="km"
            value={field.value}
            onChangeText={(value) => field.onChange(value.slice(0, 7))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="fuelLevel"
        render={({ field }) => <FuelLevelPicker value={field.value} onChange={field.onChange} />}
      />
      <Controller
        control={control}
        name="photos"
        render={({ field, fieldState }) => (
          <PhotoCapture
            label="Vehicle photos"
            photos={field.value}
            onChange={field.onChange}
            max={6}
            error={fieldState.error?.message}
            hint="Front, back and both sides, so the condition is on record."
          />
        )}
      />
      <Section title="Damage already there">
        <DamageNotesField control={control} />
      </Section>
      <Section title="What the customer wants looked at">
        <ComplaintsField
          control={control}
          name="complaints"
          error={formState.errors.complaints?.root?.message ?? formState.errors.complaints?.message}
        />
      </Section>
    </Screen>
  );
}
