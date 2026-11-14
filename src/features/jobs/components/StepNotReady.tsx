import { router } from "expo-router";
import { CircleCheckBig } from "lucide-react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { JobCard } from "@/features/jobs/types";

/** A step screen opened when its job is at another step (website `JobStepUnavailable`). */
export function StepNotReady({
  job,
  title,
  message,
}: {
  job: JobCard;
  title: string;
  message: string;
}) {
  return (
    <Screen
      header={<Header title={title} subtitle={job.number} />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label="Open job card"
            onPress={() => router.replace({ pathname: "/job/[id]", params: { id: job.id } })}
          />
        </BottomBar>
      }
    >
      <EmptyState icon={CircleCheckBig} title={title} message={message} />
    </Screen>
  );
}
