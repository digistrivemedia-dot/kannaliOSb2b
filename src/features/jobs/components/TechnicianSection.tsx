import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import type { JobCard } from "@/features/jobs/types";
import { approvedLines } from "@/features/jobs/utils";
import { formatDateTime } from "@/lib/format";

/** Who is working on the job, how far they've got and what they've reported. */
export function TechnicianSection({ job, isDone }: { job: JobCard; isDone: boolean }) {
  const tasks = approvedLines(job.estimate?.lines ?? []);
  const doneCount = tasks.filter((line) => line.isDone).length;
  const isStarted = job.timeline.some((event) => event.status === "in_progress");
  return (
    <Section title="Technician" isDone={isDone}>
      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          {job.technician ? (
            <Avatar name={job.technician.name} />
          ) : null}
          <View className="flex-1">
            <Text weight="semibold">{job.technician?.name ?? "Not assigned yet"}</Text>
            {job.technician && job.status === "approved" ? (
              <Text variant="small" tone="muted">
                Hasn't accepted the job yet
              </Text>
            ) : null}
          </View>
          {isStarted && tasks.length > 0 ? (
            <Text variant="small" weight="semibold" tabular>
              {doneCount} of {tasks.length} tasks done
            </Text>
          ) : null}
        </View>
        {job.progress.map((note) => (
          <View key={note.id} className="gap-2 rounded-input bg-gray-50 p-3">
            {note.isExtraWork ? <StatusBadge word="Extra work found" tone="warning" /> : null}
            <Text>{note.text}</Text>
            <PhotoGallery photos={note.photos} label="Progress photo" />
            <Text variant="small" tone="muted">
              {note.by.name} · {formatDateTime(note.at)}
            </Text>
          </View>
        ))}
      </Card>
    </Section>
  );
}
