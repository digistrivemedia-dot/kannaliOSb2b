import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { SelectField } from "@/components/ui/SelectField";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES } from "@/features/auth/roles";
import { useSession } from "@/features/auth/store";
import {
  useBranches,
  useCompanyUser,
  useResendInvite,
  useSaveCompanyUser,
  useSetCompanyUserStatus,
} from "@/features/company/queries";
import { personSchema, type PersonValues } from "@/features/company/schemas";
import type { CompanyUser } from "@/features/company/types";
import { errorMessage } from "@/lib/api-client";
import { applyApiErrors } from "@/lib/form-errors";
import { useSafeParam } from "@/lib/params";

/** G79: add or edit a person: name, email, phone, roles (with what each does), one branch; disable or enable, resend the invite. */
export function PersonScreen() {
  const id = useSafeParam("id");
  const person = useCompanyUser(id);
  if (id && person.isPending) {
    return (
      <Screen header={<Header title="Person" />}>
        <Skeleton shape="card" className="h-64 w-full" />
      </Screen>
    );
  }
  return <PersonForm key={person.data?.id ?? "new"} person={person.data ?? undefined} />;
}

function PersonForm({ person }: { person?: CompanyUser }) {
  const session = useSession();
  const branches = useBranches();
  const save = useSaveCompanyUser(person?.id ?? null);
  const setStatus = useSetCompanyUserStatus(person?.id ?? "");
  const resend = useResendInvite(person?.id ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const isSelf = person?.id === session.user.id;
  const { control, handleSubmit, setError } = useForm<PersonValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: person?.name ?? "",
      email: person?.email ?? "",
      mobile: person?.phone.replace(/^\+91/, "") ?? "",
      roles: person?.roles ?? [],
      branchId: person?.branchId ?? session.branchId,
    },
  });

  const submit = handleSubmit((values) =>
    save.mutate(
      {
        name: values.name,
        email: values.email,
        phone: `+91${values.mobile}`,
        roles: values.roles,
        branchId: values.branchId,
      },
      {
        onSuccess: () => {
          showToast({
            message: person ? "Saved" : `${values.name} added. An invite is on its way.`,
          });
          router.back();
        },
        onError: (error) =>
          setFormError(
            applyApiErrors(error, ["name", "email", "roles", "branchId"], setError, {
              phone: "mobile",
            }),
          ),
      },
    ),
  );

  const toggleStatus = () => {
    if (!person) return;
    const disabling = person.status !== "disabled";
    const run = () =>
      setStatus.mutate(disabling ? "disabled" : "active", {
        onSuccess: () =>
          showToast({
            message: disabling
              ? `${person.name} can't sign in now`
              : `${person.name} is enabled again`,
          }),
        onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
      });
    if (!disabling) return run();
    // Disabling signs them out everywhere at once.
    Alert.alert(
      `Disable ${person.name}?`,
      "They are signed out and can't sign in until you enable them again.",
      [
        { text: "Keep", style: "cancel" },
        { text: "Disable", style: "destructive", onPress: run },
      ],
    );
  };

  return (
    <Screen
      header={
        <Header
          title={person ? person.name : "Add person"}
          subtitle={person ? undefined : "They get an email to set a password"}
        />
      }
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={person ? "Save" : "Add and send invite"}
            onPress={submit}
            loading={save.isPending}
          />
          {person && !isSelf ? (
            <View className="flex-row gap-2">
              {person.status === "invited" ? (
                <Button
                  variant="outline"
                  label="Resend invite"
                  className="flex-1"
                  fullWidth
                  loading={resend.isPending}
                  onPress={() =>
                    resend.mutate(undefined, {
                      onSuccess: () => showToast({ message: "Invite sent again" }),
                      onError: (error) =>
                        showToast({ message: errorMessage(error), tone: "danger" }),
                    })
                  }
                />
              ) : null}
              <Button
                variant="outline"
                label={person.status === "disabled" ? "Enable" : "Disable"}
                className="flex-1"
                fullWidth
                onPress={toggleStatus}
                loading={setStatus.isPending}
              />
            </View>
          ) : null}
        </BottomBar>
      }
    >
      {person ? <StatusBadge status={person.status} /> : null}
      {formError ? <FormAlert message={formError} /> : null}
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            label="Name"
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
        name="email"
        render={({ field, fieldState }) => (
          <Input
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />
      <Controller
        control={control}
        name="mobile"
        render={({ field, fieldState }) => (
          <NumberInput
            label="Mobile"
            prefix="+91"
            value={field.value}
            onChangeText={(value) => field.onChange(value.slice(0, 10))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="branchId"
        render={({ field, fieldState }) => (
          <SelectField
            label="Branch"
            options={(branches.data ?? []).map((branch) => ({
              value: branch.id,
              label: branch.name,
            }))}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="roles"
        render={({ field, fieldState }) => (
          <Section title="Roles">
            <View>
              {ROLES.map((role) => (
                <Checkbox
                  key={role}
                  label={ROLE_LABELS[role]}
                  description={ROLE_DESCRIPTIONS[role]}
                  checked={field.value.includes(role)}
                  disabled={isSelf && role === "owner"}
                  onChange={(checked) =>
                    field.onChange(
                      checked
                        ? [...field.value, role]
                        : field.value.filter((value) => value !== role),
                    )
                  }
                />
              ))}
            </View>
            {fieldState.error ? (
              <Text variant="small" tone="danger">
                {fieldState.error.message}
              </Text>
            ) : null}
          </Section>
        )}
      />
    </Screen>
  );
}
