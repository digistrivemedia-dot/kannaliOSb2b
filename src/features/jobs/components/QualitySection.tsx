import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { NotYet } from "@/features/jobs/components/NotYet";
import type { JobCard } from "@/features/jobs/types";
import { formatDateTime } from "@/lib/format";

/** Every quality check so far: passed, or sent back for rework with the note. */
export function QualitySection({ job, isDone }: { job: JobCard; isDone: boolean }) {
  if (job.qualityChecks.length === 0) {
    return (
      <Section title="Quality check">
        <NotYet>Checked when the technician has finished.</NotYet>
      </Section>
    );
  }
  return (
    <Section title="Quality check" isDone={isDone}>
      <Card className="gap-4">
        {job.qualityChecks.map((check) => (
          <View key={check.at} className="gap-1">
            <StatusBadge
              word={check.result === "pass" ? "Passed" : "Sent back for rework"}
              tone={check.result === "pass" ? "success" : "danger"}
            />
            {check.note ? <Text>{check.note}</Text> : null}
            <Text variant="small" tone="muted">
              {check.by.name} · {formatDateTime(check.at)}
            </Text>
          </View>
        ))}
      </Card>
    </Section>
  );
}
