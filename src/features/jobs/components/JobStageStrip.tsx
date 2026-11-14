import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import type { JobCard } from "@/features/jobs/types";
import { getFinishedStages, getJobStages } from "@/features/jobs/utils";
import { cn } from "@/lib/cn";

/** How far the work has got: one segment per stage, the current one in orange. */
export function JobStageStrip({ job }: { job: JobCard }) {
  const stages = getJobStages(job);
  const finished = getFinishedStages(job);
  const isClosed = job.status === "closed";
  const currentIndex = stages.findIndex((stage) => !finished.has(stage.key));
  const current = stages[currentIndex];
  const summary = isClosed
    ? "Closed, no work done"
    : current
      ? `Step ${currentIndex + 1} of ${stages.length}: ${current.label}`
      : "Every step done";

  return (
    <View accessible accessibilityLabel={summary} className="gap-2">
      <View className="flex-row gap-1">
        {stages.map((stage, index) => (
          <View
            key={stage.key}
            className={cn(
              "h-2 flex-1 rounded-full",
              finished.has(stage.key)
                ? "bg-navy-800"
                : index === currentIndex && !isClosed
                  ? "bg-orange-700"
                  : "bg-gray-200",
            )}
          />
        ))}
      </View>
      <Text variant="small" weight="medium">
        {summary}
      </Text>
    </View>
  );
}
