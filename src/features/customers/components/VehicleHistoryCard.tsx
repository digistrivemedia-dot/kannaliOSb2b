import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PlateChip } from "@/components/ui/PlateChip";
import { Text } from "@/components/ui/Text";
import type { ServiceVisit, VehicleHistory } from "@/features/customers/types";
import { VEHICLE_TYPE_LABELS } from "@/features/jobs/utils";
import { formatDate, formatKm, formatPrice } from "@/lib/format";

/** A vehicle and every visit on record, newest first. Other garages' work shows without prices. */
export function VehicleHistoryCard({ vehicle }: { vehicle: VehicleHistory }) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <PlateChip plate={vehicle.plate} />
        <View className="flex-1">
          <Text weight="semibold" numberOfLines={1}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text variant="small" tone="muted">
            {VEHICLE_TYPE_LABELS[vehicle.type]}
            {vehicle.year ? ` · ${vehicle.year}` : ""}
          </Text>
        </View>
      </View>
      {vehicle.visits.length === 0 ? (
        <Text tone="muted">No visits on record yet.</Text>
      ) : (
        vehicle.visits.map((visit) => <VisitRow key={visit.id} visit={visit} />)
      )}
    </Card>
  );
}

/** Only this garage's own visits carry a job card (and a price). */
function VisitRow({ visit }: { visit: ServiceVisit }) {
  const jobId = visit.jobId;
  const isOurs = jobId !== undefined;
  const body = (
    <View className="gap-0.5 border-t border-gray-200 pt-3">
      <View className="flex-row items-start justify-between gap-3">
        <Text weight="medium" className="flex-1">
          {formatDate(visit.date)}
          {isOurs ? "" : ` · ${visit.garageName}`}
        </Text>
        {visit.totalInPaise !== undefined ? (
          <Text weight="semibold" tabular>
            {formatPrice(visit.totalInPaise)}
          </Text>
        ) : null}
      </View>
      <Text variant="small">{visit.summary}</Text>
      <Text variant="small" tone="muted">
        {[visit.odometerKm ? formatKm(visit.odometerKm) : null, isOurs ? null : "Another garage"]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </View>
  );
  if (!jobId) return body;
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/job/[id]", params: { id: jobId } })}
      accessibilityRole="button"
      accessibilityLabel={`Visit on ${formatDate(visit.date)}: ${visit.summary}. Open job card`}
      className="active:opacity-70"
    >
      {body}
    </Pressable>
  );
}
