import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  /** What to do next. */
  message?: string;
  action?: { label: string; onPress: () => void };
};

/** Nothing here yet, and what to do about it. */
export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-6 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-navy-50">
        <Icon size={30} color={colors.navy[700]} />
      </View>
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text tone="muted" className="text-center">
          {message}
        </Text>
      ) : null}
      {action ? (
        <Button variant="outline" label={action.label} onPress={action.onPress} className="mt-2" />
      ) : null}
    </View>
  );
}
