import { router } from "expo-router";
import { Phone } from "lucide-react-native";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { PlateChip } from "@/components/ui/PlateChip";
import { Text } from "@/components/ui/Text";
import type { CustomerSummary } from "@/features/customers/types";
import { formatCount, formatDate, formatPhone } from "@/lib/format";
import { callPhone } from "@/lib/links";

/** A customer in the list: name, phone (call), their vehicles, last visit and how many jobs. */
export function CustomerCard({ customer }: { customer: CustomerSummary }) {
  return (
    <Card
      onPress={() => router.push({ pathname: "/customer/[id]", params: { id: customer.id } })}
      accessibilityLabel={`${customer.name}, ${formatCount(customer.jobCount, "job")}. Open history`}
      className="gap-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text weight="semibold" numberOfLines={1}>
            {customer.name}
          </Text>
          <Text variant="small" tone="muted" tabular>
            {formatPhone(customer.phone)}
          </Text>
        </View>
        <IconButton
          icon={Phone}
          tone="navy"
          label={`Call ${customer.name}`}
          onPress={() => callPhone(customer.phone)}
        />
      </View>
      {customer.vehicles.map((vehicle) => (
        <View key={vehicle.id} className="flex-row items-center gap-3">
          <PlateChip plate={vehicle.plate} />
          <Text variant="small" className="flex-1" numberOfLines={1}>
            {vehicle.make} {vehicle.model}
          </Text>
        </View>
      ))}
      <Text variant="small" tone="muted">
        {formatCount(customer.jobCount, "job")}
        {customer.lastVisitAt ? ` · last visit ${formatDate(customer.lastVisitAt)}` : ""}
      </Text>
    </Card>
  );
}
