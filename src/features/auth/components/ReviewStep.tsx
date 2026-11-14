import { Image } from "expo-image";
import { Controller, type Control } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DetailRow } from "@/components/ui/DetailRow";
import { Text } from "@/components/ui/Text";
import type { RegisterValues } from "@/features/auth/schemas";
import { BUSINESS_TYPE_LABELS } from "@/features/company/business-types";
import { formatPhone } from "@/lib/format";
import { colors, radius } from "@/lib/theme";

type ReviewStepProps = {
  control: Control<RegisterValues>;
  values: RegisterValues;
  /** Opens a step to change it. */
  onEdit: (step: number) => void;
};

/** Step 4: everything at a glance, each part with Edit, then the terms. */
export function ReviewStep({ control, values, onEdit }: ReviewStepProps) {
  return (
    <>
      <Section title="Business" action={{ label: "Edit", onPress: () => onEdit(0) }}>
        <Card className="gap-3">
          <DetailRow label="Name">{values.businessName}</DetailRow>
          <DetailRow label="Type">{BUSINESS_TYPE_LABELS[values.businessType]}</DetailRow>
          {values.gstin ? <DetailRow label="GSTIN">{values.gstin}</DetailRow> : null}
          {values.pan ? <DetailRow label="PAN">{values.pan}</DetailRow> : null}
          {values.licenceNumber ? (
            <DetailRow label="Licence">{values.licenceNumber}</DetailRow>
          ) : null}
          {values.otherRegistration ? (
            <DetailRow label="Other registration">{values.otherRegistration}</DetailRow>
          ) : null}
          <DetailRow label="Licence photos">
            {values.documents.length ? `${values.documents.length} added` : "None"}
          </DetailRow>
        </Card>
      </Section>
      <Section title="Contact and location" action={{ label: "Edit", onPress: () => onEdit(1) }}>
        <Card className="gap-3">
          {values.contactName ? (
            <DetailRow label="Contact person">{values.contactName}</DetailRow>
          ) : null}
          <DetailRow label="Email">{values.email}</DetailRow>
          <DetailRow label="Mobile">{formatPhone(values.mobile)}</DetailRow>
          <DetailRow label="Address">
            {[
              values.addressLine1,
              values.addressLine2,
              `${values.city} ${values.pin}`,
              values.state,
            ]
              .filter(Boolean)
              .join("\n")}
          </DetailRow>
        </Card>
      </Section>
      <Section title="Shop photos" action={{ label: "Edit", onPress: () => onEdit(2) }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {values.photos.map((uri, index) => (
            <Image
              key={`${index}-${uri}`}
              source={{ uri }}
              accessibilityLabel={`Shop photo ${index + 1}`}
              style={{
                width: 88,
                height: 88,
                borderRadius: radius.input,
                backgroundColor: colors.gray[100],
              }}
            />
          ))}
        </ScrollView>
      </Section>
      <Controller
        control={control}
        name="acceptTerms"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <Checkbox
              label="I accept the SpareX business terms"
              description="Kannali verifies every business before it can buy or take bookings."
              checked={field.value}
              onChange={field.onChange}
            />
            {fieldState.error ? (
              <Text variant="small" tone="danger">
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />
    </>
  );
}
