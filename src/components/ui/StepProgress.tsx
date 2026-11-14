import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";

type StepProgressProps = {
  /** Zero-based. */
  step: number;
  total: number;
  title: string;
};

/** "Step 2 of 4" with the step's title and a bar of segments. */
export function StepProgress({ step, total, title }: StepProgressProps) {
  return (
    <View accessible accessibilityLabel={`Step ${step + 1} of ${total}: ${title}`} className="gap-2">
      <Text variant="label" tone="muted" sectionLabel>
        Step {step + 1} of {total}
      </Text>
      <Text variant="title">{title}</Text>
      <View className="flex-row gap-1">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index < step ? "bg-navy-800" : index === step ? "bg-orange-700" : "bg-gray-200",
            )}
          />
        ))}
      </View>
    </View>
  );
}
