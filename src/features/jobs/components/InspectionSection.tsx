import { useState } from "react";
import { Pressable, View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { NotYet } from "@/features/jobs/components/NotYet";
import type { InspectionItem, JobCard } from "@/features/jobs/types";
import { INSPECTION_RESULTS } from "@/features/jobs/utils";
import { formatDateTime } from "@/lib/format";

/** What needs work comes first; the items that were fine fold away. */
export function InspectionSection({ job, isDone }: { job: JobCard; isDone: boolean }) {
  const [showOk, setShowOk] = useState(false);
  const { inspection } = job;
  if (!inspection) {
    return (
      <Section title="Inspection">
        <NotYet>Not inspected yet.</NotYet>
      </Section>
    );
  }
  const flagged = inspection.items.filter((item) => item.result !== "ok");
  const ok = inspection.items.filter((item) => item.result === "ok");
  return (
    <Section title="Inspection" isDone={isDone}>
      <Card flush>
        <View className="p-4">
          <Text weight="semibold">
            {flagged.length
              ? `${flagged.length} of ${inspection.items.length} items need work`
              : `All ${inspection.items.length} items OK`}
          </Text>
          <Text variant="small" tone="muted">
            {formatDateTime(inspection.at)} by {inspection.by.name}
          </Text>
        </View>
        {flagged.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
        {ok.length > 0 && (
          <Pressable
            onPress={() => setShowOk((value) => !value)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showOk }}
            className="min-h-12 justify-center border-t border-gray-200 px-4 active:bg-gray-50"
          >
            <Text variant="small" weight="semibold" tone="navy">
              {showOk ? `Hide the ${ok.length} OK items` : `Show the ${ok.length} OK items`}
            </Text>
          </Pressable>
        )}
        {showOk && ok.map((item) => <ItemRow key={item.id} item={item} />)}
      </Card>
    </Section>
  );
}

function ItemRow({ item }: { item: InspectionItem }) {
  const result = INSPECTION_RESULTS[item.result];
  return (
    <View className="gap-2 border-t border-gray-200 px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text weight="medium">{item.name}</Text>
          <Text variant="small" tone="muted">
            {item.area}
            {item.note ? ` · ${item.note}` : ""}
          </Text>
        </View>
        <StatusBadge word={result.word} tone={result.tone} />
      </View>
      <PhotoGallery photos={item.photos} label={`${item.name} photo`} />
    </View>
  );
}
