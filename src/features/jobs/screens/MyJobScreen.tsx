import { router } from "expo-router";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { PlateChip } from "@/components/ui/PlateChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useSession } from "@/features/auth/store";
import { ProgressNoteForm } from "@/features/jobs/components/ProgressNoteForm";
import { TechnicianSection } from "@/features/jobs/components/TechnicianSection";
import { WithJob } from "@/features/jobs/components/WithJob";
import { useFinishWork, useRespondToJob, useSetLineDone } from "@/features/jobs/queries";
import type { JobCard } from "@/features/jobs/types";
import {
  approvedLines,
  ESTIMATE_KIND_LABELS,
  getFinishedStages,
  vehicleName,
} from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { formatNumber } from "@/lib/format";

/** G41: the technician's job, built for the workshop floor. Tick tasks, add updates, send to QC. */
export function MyJobScreen() {
  return <WithJob title="My job">{(job) => <MyJob job={job} />}</WithJob>;
}

function MyJob({ job }: { job: JobCard }) {
  const { user } = useSession();
  const respond = useRespondToJob(job.id);
  const finish = useFinishWork(job.id);
  const setDone = useSetLineDone(job.id);
  const tasks = approvedLines(job.estimate?.lines ?? []);
  const work = tasks.filter((line) => line.kind === "labour" || line.kind === "service");
  const parts = tasks.filter((line) => line.kind === "part" || line.kind === "consumable");
  const openCount = tasks.filter((line) => !line.isDone).length;
  const isMine = job.technician?.id === user.id;
  const isWorking = isMine && job.status === "in_progress";
  const toInspect = job.status === "job_card_created" || job.status === "inspection";

  const accept = () =>
    respond.mutate(
      { accept: true },
      {
        onSuccess: () => showToast({ message: "Job accepted. It's in progress." }),
        onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
      },
    );

  const sendToQc = () =>
    finish.mutate(undefined, {
      onSuccess: () => {
        showToast({ message: "Sent for quality check" });
        router.back();
      },
      onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
    });

  const bottomBar =
    isMine && job.status === "approved" ? (
      <BottomBar>
        <Button size="main" label="Accept job" onPress={accept} loading={respond.isPending} />
        <Button
          variant="outline"
          label="Can't take it"
          onPress={() => router.push({ pathname: "/my-job/[id]/decline", params: { id: job.id } })}
          fullWidth
        />
      </BottomBar>
    ) : isWorking ? (
      <BottomBar>
        <Button
          size="main"
          label={openCount ? `Done, send to QC (${openCount} to tick)` : "Done, send to QC"}
          onPress={sendToQc}
          disabled={openCount > 0}
          loading={finish.isPending}
        />
        <Button
          variant="outline"
          label="Found extra work"
          onPress={() => router.push({ pathname: "/job/[id]/extra-work", params: { id: job.id } })}
          fullWidth
        />
      </BottomBar>
    ) : toInspect ? (
      <BottomBar>
        <Button
          size="main"
          label="Start inspection"
          onPress={() => router.push({ pathname: "/job/[id]/inspection", params: { id: job.id } })}
        />
      </BottomBar>
    ) : undefined;

  const toggle = (lineId: string, isDone: boolean) =>
    setDone.mutate(
      { lineId, isDone },
      { onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }) },
    );

  return (
    <Screen
      header={<Header title={vehicleName(job.vehicle)} subtitle={job.number} />}
      bottomBar={bottomBar}
    >
      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <PlateChip plate={job.vehicle.plate} size="large" />
          <StatusBadge status={job.status} />
        </View>
        {job.complaints.length > 0 && (
          <View className="gap-1">
            <Text variant="label" tone="muted" sectionLabel>
              Customer said
            </Text>
            {job.complaints.map((complaint, index) => (
              <Text key={`${index}-${complaint}`}>• {complaint}</Text>
            ))}
          </View>
        )}
      </Card>

      {tasks.length > 0 && (
        <Section title={`Tasks, ${tasks.length - openCount} of ${tasks.length} done`}>
          <Card className="gap-1">
            {work.map((line) => (
              <Checkbox
                key={line.id}
                label={line.description}
                description={line.isExtra ? "Extra work" : undefined}
                checked={Boolean(line.isDone)}
                disabled={!isWorking}
                onChange={(isDone) => toggle(line.id, isDone)}
              />
            ))}
            {work.length === 0 && <Text tone="muted">No labour or service lines.</Text>}
          </Card>
        </Section>
      )}
      {parts.length > 0 && (
        <Section title="Parts used">
          <Card className="gap-1">
            {parts.map((line) => (
              <Checkbox
                key={line.id}
                label={`${line.description} × ${formatNumber(line.quantity)}`}
                description={[ESTIMATE_KIND_LABELS[line.kind], line.partNumber]
                  .filter(Boolean)
                  .join(" · ")}
                checked={Boolean(line.isDone)}
                disabled={!isWorking}
                onChange={(isDone) => toggle(line.id, isDone)}
              />
            ))}
          </Card>
        </Section>
      )}
      {isWorking && (
        <Section title="Add an update">
          <Card>
            <ProgressNoteForm jobId={job.id} />
          </Card>
        </Section>
      )}
      <TechnicianSection job={job} isDone={getFinishedStages(job).has("service")} />
    </Screen>
  );
}
