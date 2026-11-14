import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

const SWATCHES = [
  { name: "navy-900", value: colors.navy[900] },
  { name: "navy-800", value: colors.navy[800] },
  { name: "navy-700", value: colors.navy[700] },
  { name: "orange-700", value: colors.orange[700] },
  { name: "gray-900", value: colors.gray[900] },
  { name: "gray-600", value: colors.gray[600] },
  { name: "gray-200", value: colors.gray[200] },
  { name: "gray-50", value: colors.gray[50] },
  { name: "success-700", value: colors.success[700] },
  { name: "warning-700", value: colors.warning[700] },
  { name: "danger-700", value: colors.danger[700] },
  { name: "info-700", value: colors.info[700] },
];

export function KitType() {
  return (
    <>
      <Section title="Type">
        <Card className="gap-2">
          <Text variant="figure">₹1,24,999</Text>
          <Text variant="title">Title, 22/28 semibold</Text>
          <Text variant="heading">Heading, 18/24 semibold</Text>
          <Text>Body, 16/24 regular. Read standing at the bench.</Text>
          <Text variant="small" tone="muted">
            Small, 14/20, secondary gray-600
          </Text>
          <Text variant="label">Label, 13/18 medium</Text>
          <Text variant="label" tone="muted" sectionLabel>
            Section label
          </Text>
        </Card>
      </Section>
      <Section title="Colours">
        <View className="flex-row flex-wrap gap-2">
          {SWATCHES.map((swatch) => (
            <View key={swatch.name} className="w-[31%] gap-1">
              <View
                className="h-12 rounded-input border border-gray-200"
                style={{ backgroundColor: swatch.value }}
              />
              <Text variant="label">{swatch.name}</Text>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}
