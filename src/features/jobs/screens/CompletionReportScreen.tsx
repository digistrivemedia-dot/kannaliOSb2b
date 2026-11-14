import { Share2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { PlateChip } from "@/components/ui/PlateChip";
import { Text } from "@/components/ui/Text";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import { reportHtml } from "@/features/jobs/documents";
import type { JobCard } from "@/features/jobs/types";
import { useBillingGarage } from "@/features/jobs/use-billing-garage";
import { approvedLines, JOB_FLOW, vehicleName } from "@/features/jobs/utils";
import { formatDate, formatDateTime, formatKm, formatNumber } from "@/lib/format";
import { sharePdf } from "@/lib/share-pdf";

/** G45: what was done, the parts replaced, before and after photos, technician, QC and the next service. */
export function CompletionReportScreen() {
  return (
    <WithJob title="Completion report">
      {(job) =>
        job.status !== "closed" && JOB_FLOW.indexOf(job.status) >= JOB_FLOW.indexOf("ready") ? (
          <Report job={job} />
        ) : (
          <StepNotReady
            job={job}
            title="Not finished yet"
            message="The report is ready once the vehicle passes its quality check."
          />
        )
      }
    </WithJob>
  );
}

function Report({ job }: { job: JobCard }) {
  const garage = useBillingGarage(job);
  const [isSharing, setIsSharing] = useState(false);
  const lines = approvedLines(job.estimate?.lines ?? []);
  const work = lines.filter((line) => line.kind === "labour" || line.kind === "service");
  const parts = lines.filter((line) => line.kind === "part" || line.kind === "consumable");
  const before = job.checkIn?.photos ?? [];
  const after = [...job.progress.flatMap((note) => note.photos), ...(job.handover?.photos ?? [])];
  const check = job.qualityChecks.at(-1);
  const next = job.nextService;

  const share = async () => {
    setIsSharing(true);
    await sharePdf(reportHtml(job, garage), `Service report ${job.number}`);
    setIsSharing(false);
  };

  return (
    <Screen
      header={<Header title="Completion report" subtitle={job.number} />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            icon={Share2}
            label="Share PDF"
            onPress={() => void share()}
            loading={isSharing}
          />
        </BottomBar>
      }
    >
      <Card className="gap-2">
        <PlateChip plate={job.vehicle.plate} size="large" />
        <Text variant="heading">{vehicleName(job.vehicle)}</Text>
        <Text tone="muted">{job.customer.name}</Text>
        {job.checkIn ? (
          <Text variant="small" tone="muted">
            Came in {formatDateTime(job.checkIn.at)} at {formatKm(job.checkIn.odometerKm)}
          </Text>
        ) : null}
      </Card>
      <Section title="Work done">
        <Card className="gap-1">
          {work.length ? (
            work.map((line) => <Text key={line.id}>• {line.description}</Text>)
          ) : (
            <Text tone="muted">None.</Text>
          )}
        </Card>
      </Section>
      <Section title="Parts replaced">
        <Card className="gap-1">
          {parts.length ? (
            parts.map((line) => (
              <Text key={line.id}>
                • {line.description} × {formatNumber(line.quantity)}
                {line.partNumber ? ` (${line.partNumber})` : ""}
              </Text>
            ))
          ) : (
            <Text tone="muted">No parts replaced.</Text>
          )}
        </Card>
      </Section>
      <Section title="Before and after">
        <Card className="gap-3">
          <View className="gap-1">
            <Text variant="label" tone="muted">
              Before
            </Text>
            {before.length ? (
              <PhotoGallery photos={before} label="Before photo" />
            ) : (
              <Text tone="muted">No photos.</Text>
            )}
          </View>
          <View className="gap-1">
            <Text variant="label" tone="muted">
              After
            </Text>
            {after.length ? (
              <PhotoGallery photos={after} label="After photo" />
            ) : (
              <Text tone="muted">No photos.</Text>
            )}
          </View>
        </Card>
      </Section>
      <Section title="Technician and quality check">
        <Card className="gap-1">
          <Text>{job.technician?.name ?? "Not recorded"}</Text>
          {check ? (
            <Text variant="small" tone="muted">
              Quality check {check.result === "pass" ? "passed" : "sent back"} by {check.by.name},{" "}
              {formatDateTime(check.at)}
            </Text>
          ) : null}
        </Card>
      </Section>
      <Section title="Next service due">
        <Card>
          <Text>
            {next?.date || next?.odometerKm
              ? [
                  next.date ? formatDate(next.date) : "",
                  next.odometerKm ? `at ${formatKm(next.odometerKm)}` : "",
                ]
                  .filter(Boolean)
                  .join(", or ")
              : "Set at handover"}
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}
