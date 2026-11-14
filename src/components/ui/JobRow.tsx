import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { PlateChip } from "@/components/ui/PlateChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { statusTone, type Status } from "@/lib/status";
import { colors, toneColors } from "@/lib/theme";

type JobRowProps = {
  plate: string;
  /** "Honda Activa 6G" */
  vehicle: string;
  customer: string;
  status: Status;
  /** "2 h ago" */
  age: string;
  technician?: string;
  /** The step this user takes next, e.g. "Start QC", shown in orange. */
  nextStep?: string;
  onPress: () => void;
};

/** A job in a list: status edge, plate, vehicle, customer, status in words, age and technician. */
export function JobRow({
  plate,
  vehicle,
  customer,
  status,
  age,
  technician,
  nextStep,
  onPress,
}: JobRowProps) {
  const { tone, word } = statusTone(status);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[plate, vehicle, customer, word, age, nextStep && `Next: ${nextStep}`]
        .filter(Boolean)
        .join(", ")}
      className="flex-row overflow-hidden rounded-card border border-gray-200 bg-white active:bg-gray-50"
    >
      <View className="w-1.5" style={{ backgroundColor: toneColors[tone].strong }} />
      <View className="flex-1 gap-2 p-4 pl-3.5">
        <View className="flex-row items-center justify-between gap-2">
          <PlateChip plate={plate} />
          <Text variant="small" tone="muted">
            {age}
          </Text>
        </View>
        <View>
          <Text weight="semibold" numberOfLines={1}>
            {vehicle}
          </Text>
          <Text variant="small" tone="muted" numberOfLines={1}>
            {customer}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={status} />
            {nextStep ? (
              <Text variant="small" weight="semibold" tone="action" numberOfLines={1}>
                {nextStep}
              </Text>
            ) : null}
          </View>
          {technician ? <Avatar name={technician} size="small" /> : null}
        </View>
      </View>
      <View className="justify-center pr-2">
        <ChevronRight size={22} color={colors.gray[500]} />
      </View>
    </Pressable>
  );
}
