import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import { useRecordQualityCheck } from "@/features/jobs/queries";
import type { JobCard } from "@/features/jobs/types";
import { qualityChecklistFor } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";

/** G39: the job's own work, then the standard checks. Pass → Ready, or Rework with a note → back to the technician. */
export function QualityCheckScreen() {
  return (
    <WithJob title="Quality check">
      {(job) =>
        job.status === "quality_check" ? (
          <QualityCheckForm job={job} />
        ) : (
          <StepNotReady
            job={job}
            title="Not ready for its check"
            message="The quality check comes once the technician has finished the work."
          />
        )
      }
    </WithJob>
  );
}

function QualityCheckForm({ job }: { job: JobCard }) {
  const [checks, setChecks] = useState(() =>
    qualityChecklistFor(job).map((label) => ({ label, isOk: false })),
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const record = useRecordQualityCheck(job.id);
  const allOk = checks.every((check) => check.isOk);

  const submit = (result: "pass" | "rework") => {
    if (result === "pass" && !allOk)
      return setError("Tick every check before passing the vehicle.");
    if (result === "rework" && note.trim().length < 3) return setError("Say what needs redoing.");
    setError(null);
    record.mutate(
      { items: checks, result, note: note.trim() || undefined },
      {
        onSuccess: () => {
          showToast({
            message:
              result === "pass" ? "Passed. Ready for delivery." : "Sent back to the technician",
          });
          router.back();
        },
        onError: (failure) => setError(errorMessage(failure)),
      },
    );
  };

  return (
    <Screen
      header={<Header title="Quality check" subtitle={`${job.vehicle.plate} · ${job.number}`} />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label="Pass"
            onPress={() => submit("pass")}
            disabled={!allOk}
            loading={record.isPending && allOk}
          />
          <Button
            variant="outline"
            label="Send back for rework"
            onPress={() => submit("rework")}
            fullWidth
          />
        </BottomBar>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      <Section title={`Checks, ${checks.filter((check) => check.isOk).length} of ${checks.length}`}>
        <Card className="gap-1">
          {checks.map((check, index) => (
            <Checkbox
              key={check.label}
              label={check.label}
              checked={check.isOk}
              onChange={(isOk) =>
                setChecks((current) =>
                  current.map((item, i) => (i === index ? { ...item, isOk } : item)),
                )
              }
            />
          ))}
        </Card>
      </Section>
      <View className="gap-2">
        <Input
          label="Note (needed to send it back)"
          placeholder="Front brake still soft, bleed it again"
          value={note}
          onChangeText={setNote}
          multiline
        />
        <Text variant="small" tone="muted">
          Sending it back puts the job in progress again with the same technician.
        </Text>
      </View>
    </Screen>
  );
}
