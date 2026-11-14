import { CircleAlert } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

/** A form-wide problem, such as a wrong password, above the fields. */
export function FormAlert({ message }: { message: string }) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="flex-row gap-3 rounded-input border border-danger-600 bg-danger-50 p-3"
    >
      <CircleAlert size={20} color={colors.danger[700]} />
      <Text variant="small" weight="medium" tone="danger" className="flex-1">
        {message}
      </Text>
    </View>
  );
}
