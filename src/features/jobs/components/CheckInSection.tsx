import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { Text } from "@/components/ui/Text";
import { NotYet } from "@/features/jobs/components/NotYet";
import type { JobCard } from "@/features/jobs/types";
import { FUEL_LEVEL_LABELS } from "@/features/jobs/utils";
import { formatDateTime, formatKm } from "@/lib/format";

export function CheckInSection({ job, isDone }: { job: JobCard; isDone: boolean }) {
  const { checkIn } = job;
  if (!checkIn) {
    return (
      <Section title="Check-in">
        <NotYet>The vehicle hasn't been checked in yet.</NotYet>
      </Section>
    );
  }
  const damagePhotos = checkIn.damages.flatMap((damage) => damage.photos);
  return (
    <Section title="Check-in" isDone={isDone}>
      <Card className="gap-4">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <DetailRow label="Odometer">
              <Text weight="semibold" tabular>
                {formatKm(checkIn.odometerKm)}
              </Text>
            </DetailRow>
          </View>
          <View className="flex-1">
            <DetailRow label="Fuel">
              <Text weight="semibold">{FUEL_LEVEL_LABELS[checkIn.fuelLevel]}</Text>
            </DetailRow>
          </View>
        </View>
        <DetailRow label="Damage">
          {checkIn.damages.length
            ? checkIn.damages.map((damage) => `${damage.area}: ${damage.note}`).join("\n")
            : "None noted"}
        </DetailRow>
        <PhotoGallery photos={checkIn.photos} label="Check-in photo" />
        <PhotoGallery photos={damagePhotos} label="Damage photo" />
        <Text variant="small" tone="muted">
          Received {formatDateTime(checkIn.at)} by {checkIn.by.name}
        </Text>
      </Card>
    </Section>
  );
}
