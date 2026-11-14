import { CircleCheck, Clock } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

export type NextStepView =
  /** This user takes the next step: one big orange button. */
  | { kind: "action"; label: string; onPress: () => void }
  /** Someone else does: the bar says who, or what the job waits for. */
  | { kind: "waiting"; text: string }
  /** Nothing left to do on this job. */
  | { kind: "done"; text: string };

/** The bottom bar of a job card: always the one next step, or who has it. */
export function NextStepBar({ step }: { step: NextStepView }) {
  return (
    <BottomBar>
      {step.kind === "action" ? (
        <Button size="main" label={step.label} onPress={step.onPress} />
      ) : (
        <View
          accessible
          accessibilityRole="text"
          className="min-h-14 flex-row items-center gap-3 rounded-button bg-gray-100 px-4"
        >
          {step.kind === "done" ? (
            <CircleCheck size={22} color={colors.success[700]} />
          ) : (
            <Clock size={22} color={colors.gray[700]} />
          )}
          <Text weight="semibold" tone={step.kind === "done" ? "success" : "default"} className="flex-1">
            {step.text}
          </Text>
        </View>
      )}
    </BottomBar>
  );
}
