import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import {
  useBranches,
  useDeleteBranch,
  useMakeMainBranch,
  usePincode,
  useSaveBranch,
} from "@/features/company/queries";
import { branchSchema, type BranchValues } from "@/features/company/schemas";
import type { Branch } from "@/features/company/types";
import { errorMessage } from "@/lib/api-client";
import { applyApiErrors } from "@/lib/form-errors";
import { useSafeParam } from "@/lib/params";

const EMPTY: BranchValues = {
  name: "",
  line1: "",
  line2: "",
  pin: "",
  city: "",
  state: "",
  contactName: "",
  contactMobile: "",
};

function toValues(branch: Branch): BranchValues {
  return {
    name: branch.name,
    line1: branch.address.line1,
    line2: branch.address.line2 ?? "",
    pin: branch.address.pin,
    city: branch.address.city,
    state: branch.address.state,
    contactName: branch.contactName,
    contactMobile: branch.contactPhone.replace(/^\+91/, ""),
  };
}

/** Add or edit an address (a branch): G77, and G80 for a garage's branches. Remove and Make default. */
export function AddressFormScreen() {
  const id = useSafeParam("id");
  const branches = useBranches();
  const branch = id ? branches.data?.find((candidate) => candidate.id === id) : undefined;
  if (id && branches.isPending) {
    return (
      <Screen header={<Header title="Address" />}>
        <Skeleton shape="card" className="h-64 w-full" />
      </Screen>
    );
  }
  return <BranchForm key={branch?.id ?? "new"} branch={branch} />;
}

function BranchForm({ branch }: { branch?: Branch }) {
  const save = useSaveBranch(branch?.id ?? null);
  const remove = useDeleteBranch();
  const makeMain = useMakeMainBranch();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, setValue } = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch ? toValues(branch) : EMPTY,
  });
  const pin = useWatch({ control, name: "pin" });
  const place = usePincode(pin);
  useEffect(() => {
    if (!place.data) return;
    setValue("city", place.data.city, { shouldValidate: true });
    setValue("state", place.data.state, { shouldValidate: true });
  }, [place.data, setValue]);

  const submit = handleSubmit((values) =>
    save.mutate(
      {
        name: values.name,
        address: {
          line1: values.line1,
          line2: values.line2 || undefined,
          city: values.city,
          state: values.state,
          pin: values.pin,
        },
        contactName: values.contactName,
        contactPhone: `+91${values.contactMobile}`,
      },
      {
        onSuccess: () => {
          showToast({ message: branch ? "Address saved" : "Address added" });
          router.back();
        },
        onError: (error) =>
          setFormError(
            applyApiErrors(error, ["name", "contactName"], setError, {
              "address.line1": "line1",
              "address.pin": "pin",
              "address.city": "city",
              "address.state": "state",
              contactPhone: "contactMobile",
            }),
          ),
      },
    ),
  );

  const confirmRemove = () => {
    if (!branch) return;
    Alert.alert(
      `Remove ${branch.name}?`,
      "Orders can't be delivered there any more. It can't be undone.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            remove.mutate(branch.id, {
              onSuccess: () => {
                showToast({ message: "Address removed" });
                router.back();
              },
              onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
            }),
        },
      ],
    );
  };

  const field = (
    name: keyof BranchValues,
    label: string,
    extra: Partial<React.ComponentProps<typeof Input>> = {},
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: input, fieldState }) => (
        <Input
          label={label}
          value={input.value}
          onChangeText={input.onChange}
          onBlur={input.onBlur}
          error={fieldState.error?.message}
          {...extra}
        />
      )}
    />
  );

  return (
    <Screen
      header={<Header title={branch ? branch.name : "New address"} />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={branch ? "Save" : "Add address"}
            onPress={submit}
            loading={save.isPending}
          />
          {branch && !branch.isMain ? (
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                label="Make default"
                className="flex-1"
                fullWidth
                loading={makeMain.isPending}
                onPress={() =>
                  makeMain.mutate(branch.id, {
                    onSuccess: () => showToast({ message: `${branch.name} is now the default` }),
                    onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
                  })
                }
              />
              <Button
                variant="outline"
                label="Remove"
                className="flex-1"
                fullWidth
                onPress={confirmRemove}
                loading={remove.isPending}
              />
            </View>
          ) : null}
        </BottomBar>
      }
    >
      {formError ? <FormAlert message={formError} /> : null}
      {field("name", "Branch name", { placeholder: "Whitefield", autoCapitalize: "words" })}
      {field("line1", "Building and street", { autoCapitalize: "words" })}
      {field("line2", "Area (optional)", { autoCapitalize: "words" })}
      <Controller
        control={control}
        name="pin"
        render={({ field: input, fieldState }) => (
          <NumberInput
            label="PIN code"
            value={input.value}
            onChangeText={(value) => input.onChange(value.slice(0, 6))}
            onBlur={input.onBlur}
            error={fieldState.error?.message}
            hint={place.isFetching ? "Looking up the PIN…" : undefined}
          />
        )}
      />
      {field("city", "City", { autoCapitalize: "words" })}
      {field("state", "State", { autoCapitalize: "words" })}
      {field("contactName", "Who receives deliveries", { autoCapitalize: "words" })}
      <Controller
        control={control}
        name="contactMobile"
        render={({ field: input, fieldState }) => (
          <NumberInput
            label="Their mobile"
            prefix="+91"
            value={input.value}
            onChangeText={(value) => input.onChange(value.slice(0, 10))}
            onBlur={input.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
    </Screen>
  );
}
