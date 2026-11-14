import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useSession } from "@/features/auth/store";
import { useCan } from "@/features/auth/use-can";
import { BUSINESS_TYPE_LABELS } from "@/features/company/business-types";
import { useUpdateBusinessContact } from "@/features/company/queries";
import { contactSchema, type ContactValues } from "@/features/company/schemas";
import { applyApiErrors } from "@/lib/form-errors";

/** G76: name, type, GSTIN and PAN (fixed once verified); contact (editable); photos; discount and credit (Kannali sets them). */
export function BusinessProfileScreen() {
  const { business } = useSession();
  const canEdit = useCan("company:manage");
  const update = useUpdateBusinessContact();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: business.email, mobile: business.phone.replace(/^\+91/, "") },
  });
  const address = business.registeredAddress;

  const save = handleSubmit((values) => {
    setFormError(null);
    update.mutate(
      { email: values.email, phone: `+91${values.mobile}` },
      {
        onSuccess: () => showToast({ message: "Contact saved" }),
        onError: (error) =>
          setFormError(applyApiErrors(error, ["email"], setError, { phone: "mobile" })),
      },
    );
  });

  return (
    <Screen
      header={<Header title="Business profile" />}
      bottomBar={
        canEdit && formState.isDirty ? (
          <BottomBar>
            <Button size="main" label="Save contact" onPress={save} loading={update.isPending} />
          </BottomBar>
        ) : undefined
      }
    >
      <Card className="gap-3">
        <Text variant="title">{business.name}</Text>
        <DetailRow label="Type">{BUSINESS_TYPE_LABELS[business.type]}</DetailRow>
        <DetailRow label="GSTIN">{business.gstin ?? "Not GST registered"}</DetailRow>
        {business.pan ? <DetailRow label="PAN">{business.pan}</DetailRow> : null}
        <DetailRow label="Registered address">
          {[address.line1, address.line2, `${address.city} ${address.pin}`, address.state]
            .filter(Boolean)
            .join("\n")}
        </DetailRow>
        <Text variant="small" tone="muted">
          Kannali verified these; ask them to change any.
        </Text>
      </Card>
      <Section title="Contact">
        {formError ? <FormAlert message={formError} /> : null}
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
              editable={canEdit}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="mobile"
          render={({ field, fieldState }) => (
            <NumberInput
              label="Phone"
              prefix="+91"
              value={field.value}
              onChangeText={(value) => field.onChange(value.slice(0, 10))}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              editable={canEdit}
            />
          )}
        />
      </Section>
      <Section title="With Kannali">
        <Card className="gap-3">
          <DetailRow label="Business discount">{`${business.discountPercent}% off retail prices, excl. GST`}</DetailRow>
          <DetailRow label="Credit">{business.creditEnabled ? "On" : "Not set up"}</DetailRow>
        </Card>
      </Section>
      {business.photos.length > 0 || business.documents.length > 0 ? (
        <Section title="Photos and documents">
          <Card className="gap-3">
            <PhotoGallery photos={business.photos} label="Shop photo" />
            <PhotoGallery photos={business.documents} label="Document" />
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}
