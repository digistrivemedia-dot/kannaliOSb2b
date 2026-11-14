import { Check, X } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

export type TimelineStep = {
  label: string;
  /** "12 Oct, 3:45 pm" */
  when?: string;
  note?: string;
  /** done: ticked · current: where things stand now · stopped: ended early. */
  state: "done" | "current" | "stopped";
};

/** What happened, in order, newest last. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View accessibilityRole="list">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <View key={`${step.label}-${index}`} className="flex-row gap-3" accessibilityRole="text">
            <View className="items-center">
              <Dot state={step.state} />
              {!isLast && <View className="w-0.5 flex-1 bg-gray-200" />}
            </View>
            <View className={cn("flex-1", !isLast && "pb-4")}>
              <Text weight={step.state === "current" ? "semibold" : "medium"}>{step.label}</Text>
              {step.when ? (
                <Text variant="small" tone="muted">
                  {step.when}
                </Text>
              ) : null}
              {step.note ? (
                <Text variant="small" tone="muted">
                  {step.note}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Dot({ state }: { state: TimelineStep["state"] }) {
  if (state === "current") {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-orange-700 bg-white">
        <View className="h-2.5 w-2.5 rounded-full bg-orange-700" />
      </View>
    );
  }
  return (
    <View
      className={cn(
        "h-6 w-6 items-center justify-center rounded-full",
        state === "done" ? "bg-navy-800" : "bg-gray-500",
      )}
    >
      {state === "done" ? (
        <Check size={14} strokeWidth={3} color={colors.white} />
      ) : (
        <X size={14} strokeWidth={3} color={colors.white} />
      )}
    </View>
  );
}
