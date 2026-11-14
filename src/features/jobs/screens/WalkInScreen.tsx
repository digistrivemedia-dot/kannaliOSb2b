import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChips } from "@/components/ui/FilterChips";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { PlateChip } from "@/components/ui/PlateChip";
import { PlateInput } from "@/components/ui/PlateInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { ComplaintsField } from "@/features/jobs/components/ComplaintsField";
import { useCreateWalkIn, useVehicleLookup } from "@/features/jobs/queries";
import { VEHICLE_TYPES, walkInSchema, type WalkInValues } from "@/features/jobs/schemas";
import { VEHICLE_TYPE_LABELS, vehicleName } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { clearDraft, savedDraft, useFormDraft } from "@/lib/drafts";
import { applyApiErrors } from "@/lib/form-errors";
import { formatPhone, isValidPlate } from "@/lib/format";

const EMPTY: WalkInValues = {
  plate: "",
  vehicleId: "",
  type: "bike",
  make: "",
  model: "",
  customerName: "",
  customerPhone: "",
  complaints: [{ text: "" }],
};

/**
 * G32: a vehicle that came in without a booking. Find it by plate (on file: its vehicle and owner;
 * new: the customer and vehicle), say what's wrong, and open the job card at "Vehicle received".
 */
export function WalkInScreen() {
  const branch = useActiveBranch();
  const draftKey = `walk-in:${branch.id}`;
  const form = useForm<WalkInValues>({
    resolver: zodResolver(walkInSchema),
    defaultValues: savedDraft<WalkInValues>(draftKey) ?? EMPTY,
  });
  useFormDraft(draftKey, form);
  const { control, handleSubmit, setValue, setError, formState } = form;
  const plate = useWatch({ control, name: "plate" });
  const [searched, setSearched] = useState<string | null>(isValidPlate(plate) ? plate : null);
  const lookup = useVehicleLookup(searched);
  const found = lookup.data;
  const create = useCreateWalkIn();
  const [formError, setFormError] = useState<string | null>(null);

  const find = () => {
    if (!isValidPlate(plate)) {
      setError("plate", { message: "Enter a number plate like KA 01 AB 1234." });
      return;
    }
    setSearched(plate);
  };

  const changePlate = () => {
    setSearched(null);
    setValue("vehicleId", "");
  };

  const open = handleSubmit((values) => {
    setFormError(null);
    create.mutate(
      {
        branchId: branch.id,
        ...(found
          ? { vehicleId: found.vehicle.id }
          : {
              newVehicle: {
                plate: values.plate,
                type: values.type,
                make: values.make,
                model: values.model,
                customer: { name: values.customerName, phone: `+91${values.customerPhone}` },
              },
            }),
        complaints: values.complaints.map((item) => item.text).filter(Boolean),
      },
      {
        onSuccess: (job) => {
          clearDraft(draftKey);
          showToast({ message: `Job card ${job.number} opened` });
          router.replace({ pathname: "/job/[id]/check-in", params: { id: job.id } });
        },
        onError: (error) =>
          setFormError(
            applyApiErrors(
              error,
              ["plate", "make", "model", "customerName", "customerPhone"],
              setError,
              {
                "newVehicle.plate": "plate",
                "newVehicle.make": "make",
                "newVehicle.model": "model",
                "newVehicle.customer.name": "customerName",
                "newVehicle.customer.phone": "customerPhone",
              },
            ),
          ),
      },
    );
  });

  // A vehicle on file is confirmed by opening the job card; its id lets the form skip the new-vehicle fields.
  useEffect(() => {
    setValue("vehicleId", found?.vehicle.id ?? "");
  }, [found, setValue]);
  const isLookedUp = searched !== null && !lookup.isPending;

  return (
    <Screen
      header={<Header title="New walk-in" subtitle={branch.name} />}
      bottomBar={
        <BottomBar>
          {isLookedUp && !lookup.isError ? (
            <Button
              size="main"
              label="Open job card"
              onPress={open}
              loading={create.isPending || formState.isSubmitting}
            />
          ) : (
            <Button
              size="main"
              label="Find vehicle"
              onPress={find}
              loading={searched !== null && lookup.isPending}
            />
          )}
        </BottomBar>
      }
    >
      {formError ? <FormAlert message={formError} /> : null}
      {searched === null ? (
        <Controller
          control={control}
          name="plate"
          render={({ field, fieldState }) => (
            <PlateInput
              label="Number plate"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={find}
            />
          )}
        />
      ) : (
        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <PlateChip plate={searched} size="large" />
            <Button variant="ghost" label="Change" onPress={changePlate} />
          </View>
          {lookup.isPending ? (
            <View accessible accessibilityLabel="Looking up the plate" className="gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-40" />
            </View>
          ) : lookup.isError ? (
            <Text tone="danger">{errorMessage(lookup.error)}</Text>
          ) : found ? (
            <View className="gap-1">
              <Text variant="heading">{vehicleName(found.vehicle)}</Text>
              <Text tone="muted">
                {found.customer.name} · {formatPhone(found.customer.phone)}
              </Text>
              <Text variant="small" tone="success" weight="medium">
                On file. Check it's the same vehicle, then open the job card.
              </Text>
            </View>
          ) : (
            <Text tone="muted">New to the garage. Add the vehicle and its owner below.</Text>
          )}
        </Card>
      )}

      {isLookedUp && !lookup.isError && !found && <NewVehicleFields control={control} />}

      {isLookedUp && !lookup.isError && (
        <Section title="What the customer wants looked at">
          <ComplaintsField
            control={control}
            name="complaints"
            error={
              formState.errors.complaints?.root?.message ?? formState.errors.complaints?.message
            }
          />
        </Section>
      )}
    </Screen>
  );
}

function NewVehicleFields({
  control,
}: {
  control: ReturnType<typeof useForm<WalkInValues>>["control"];
}) {
  return (
    <>
      <Section title="Vehicle">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <View className="-mx-4">
              <FilterChips
                label="Vehicle type"
                options={VEHICLE_TYPES.map((type) => ({
                  value: type,
                  label: VEHICLE_TYPE_LABELS[type],
                }))}
                value={field.value}
                onChange={field.onChange}
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="make"
          render={({ field, fieldState }) => (
            <Input
              label="Make"
              placeholder="Honda"
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
          name="model"
          render={({ field, fieldState }) => (
            <Input
              label="Model"
              placeholder="Activa 6G"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />
      </Section>
      <Section title="Customer">
        <Controller
          control={control}
          name="customerName"
          render={({ field, fieldState }) => (
            <Input
              label="Name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
              autoComplete="name"
            />
          )}
        />
        <Controller
          control={control}
          name="customerPhone"
          render={({ field, fieldState }) => (
            <NumberInput
              label="Mobile number"
              prefix="+91"
              value={field.value}
              onChangeText={(value) => field.onChange(value.slice(0, 10))}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </Section>
    </>
  );
}
