import { Phone } from "lucide-react-native";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { PlateChip } from "@/components/ui/PlateChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import type { JobCard } from "@/features/jobs/types";
import { vehicleName } from "@/features/jobs/utils";
import { formatPhone, formatWhen } from "@/lib/format";
import { callPhone } from "@/lib/links";

/** The top of a job card: plate, vehicle, status, customer (call) and what they asked for. */
export function JobHero({ job }: { job: JobCard }) {
  const cameIn =
    job.source === "walk_in"
      ? "Walk-in"
      : `Booking${job.bookingNumber ? ` ${job.bookingNumber}` : ""}`;
  const askedFor = [
    ...(job.bookedServices ?? []).map((service) => service.name),
    ...job.complaints,
  ];
  return (
    <Card className="gap-4">
      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <PlateChip plate={job.vehicle.plate} size="large" />
          <StatusBadge status={job.status} />
        </View>
        <View>
          <Text variant="title">{vehicleName(job.vehicle)}</Text>
          <Text variant="small" tone="muted">
            {job.number} · {cameIn}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3 border-t border-gray-200 pt-3">
        <View className="flex-1">
          <Text weight="semibold">{job.customer.name}</Text>
          <Text variant="small" tone="muted" tabular>
            {formatPhone(job.customer.phone)}
          </Text>
        </View>
        <IconButton
          icon={Phone}
          label={`Call ${job.customer.name}`}
          tone="navy"
          onPress={() => callPhone(job.customer.phone)}
        />
      </View>

      {job.promisedAt ? (
        <Text variant="small">
          <Text variant="small" tone="muted">
            Promised for{" "}
          </Text>
          <Text variant="small" weight="semibold">
            {formatWhen(job.promisedAt)}
          </Text>
        </Text>
      ) : null}

      {askedFor.length > 0 && (
        <View className="gap-1.5 rounded-input bg-gray-50 p-3">
          <Text variant="label" tone="muted" sectionLabel>
            Asked for
          </Text>
          {askedFor.map((item, index) => (
            <Text key={`${index}-${item}`}>• {item}</Text>
          ))}
        </View>
      )}
    </Card>
  );
}
