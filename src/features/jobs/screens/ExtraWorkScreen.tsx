import { router } from "expo-router";
import { View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useCan } from "@/features/auth/use-can";
import { EstimateBuilder } from "@/features/jobs/components/EstimateBuilder";
import { ProgressNoteForm } from "@/features/jobs/components/ProgressNoteForm";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import type { JobCard } from "@/features/jobs/types";
import { approvedLines } from "@/features/jobs/utils";
import { formatPrice } from "@/lib/format";

/**
 * G38: work found after the customer approved. The desk adds priced lines and sends them for approval
 * (the job goes back to "Waiting for customer"); a technician reports what they found, with photos,
 * for the desk to price.
 */
export function ExtraWorkScreen() {
  const canPrice = useCan("jobs:manage");
  return (
    <WithJob title="Extra work">
      {(job) => {
        const isWorking = job.status === "approved" || job.status === "in_progress";
        if (!isWorking) {
          return (
            <StepNotReady
              job={job}
              title="Not while the job is at this step"
              message="Extra work is added while the vehicle is being serviced."
            />
          );
        }
        if (canPrice)
          return <EstimateBuilder job={job} mode="revision" intro={<ApprovedWork job={job} />} />;
        return (
          <Screen
            header={
              <Header title="Found extra work" subtitle={`${job.vehicle.plate} · ${job.number}`} />
            }
          >
            <ApprovedWork job={job} />
            <Section title="What you found">
              <ProgressNoteForm jobId={job.id} isExtraWork onSent={() => router.back()} />
            </Section>
          </Screen>
        );
      }}
    </WithJob>
  );
}

function ApprovedWork({ job }: { job: JobCard }) {
  const lines = approvedLines(job.estimate?.lines ?? []);
  const reported = job.progress.findLast((note) => note.isExtraWork);
  return (
    <>
      {reported ? (
        <Card className="gap-1 border-warning-500 bg-warning-50">
          <StatusBadge word="Extra work found" tone="warning" />
          <Text>{reported.text}</Text>
          <Text variant="small" tone="muted">
            {reported.by.name}
          </Text>
        </Card>
      ) : null}
      <Section title="Already approved">
        <Card className="gap-2">
          {lines.length ? (
            lines.map((line) => (
              <View key={line.id} className="flex-row justify-between gap-3">
                <Text className="flex-1">{line.description}</Text>
                <Text tabular>{formatPrice(line.unitPriceInPaise * line.quantity)}</Text>
              </View>
            ))
          ) : (
            <Text tone="muted">Nothing approved yet.</Text>
          )}
        </Card>
      </Section>
    </>
  );
}
