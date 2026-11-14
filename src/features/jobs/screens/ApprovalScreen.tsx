import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChips } from "@/components/ui/FilterChips";
import { FormAlert } from "@/components/ui/FormAlert";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { MoneyTotals } from "@/features/jobs/components/MoneyTotals";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import { useRecordApproval } from "@/features/jobs/queries";
import type { EstimateLine, JobCard } from "@/features/jobs/types";
import { approvedLines, ESTIMATE_KIND_LABELS, sumLines } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { formatNumber, formatPrice } from "@/lib/format";

/** How the customer answered (website `ApprovalForm`). */
const CHANNELS = ["In person", "By phone", "On WhatsApp", "In the SpareX app"] as const;
type Channel = (typeof CHANNELS)[number];
type Decision = "approved" | "rejected";

/** G37: the customer's answer, line by line, for a customer who answered by phone or in person. */
export function ApprovalScreen() {
  return (
    <WithJob title="Customer's answer">
      {(job) =>
        job.status === "awaiting_approval" && job.estimate ? (
          <ApprovalForm job={job} lines={job.estimate.lines} />
        ) : (
          <StepNotReady
            job={job}
            title="Nothing is waiting for the customer"
            message="Their answer is already recorded, or the estimate hasn't been sent yet."
          />
        )
      }
    </WithJob>
  );
}

function ApprovalForm({ job, lines }: { job: JobCard; lines: EstimateLine[] }) {
  const pending = lines.filter((line) => line.approval === "pending");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [channel, setChannel] = useState<Channel>("By phone");
  const [error, setError] = useState<string | null>(null);
  const record = useRecordApproval(job.id);
  const approved = pending.filter((line) => decisions[line.id] === "approved");
  const allAnswered = pending.every((line) => decisions[line.id]);
  const isFirstEstimate = !lines.some((line) => line.approval === "approved");
  const decideAll = (decision: Decision) =>
    setDecisions(Object.fromEntries(pending.map((line) => [line.id, decision])));

  const send = () =>
    record.mutate(
      { decisions, note: channel },
      {
        onSuccess: () => {
          showToast({
            message: approved.length
              ? `${approved.length} of ${pending.length} approved`
              : isFirstEstimate
                ? "Estimate rejected. The job is closed."
                : "Extra work rejected. The approved work carries on.",
          });
          router.back();
        },
        onError: (failure) => setError(errorMessage(failure)),
      },
    );

  const save = () => {
    if (!allAnswered) {
      setError("Mark an answer for every line.");
      return;
    }
    setError(null);
    // Rejecting the whole first estimate closes the job, which can't be undone.
    if (approved.length === 0 && isFirstEstimate) {
      Alert.alert(
        "Close the job?",
        job.pickupDrop
          ? "Every line is rejected. The job closes and only the pick-up fee is billed."
          : "Every line is rejected. The job closes with no fee.",
        [
          { text: "Go back", style: "cancel" },
          { text: "Close the job", style: "destructive", onPress: send },
        ],
      );
      return;
    }
    send();
  };

  return (
    <Screen
      header={
        <Header title="Customer's answer" subtitle={`${job.vehicle.plate} · ${job.number}`} />
      }
      bottomBar={
        <BottomBar>
          <Button size="main" label="Save the answer" onPress={save} loading={record.isPending} />
        </BottomBar>
      }
    >
      <Text tone="muted">
        Ask about each line and mark what the customer said. Only approved lines are worked on and
        billed.
      </Text>
      {error ? <FormAlert message={error} /> : null}
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          label="Approve all"
          onPress={() => decideAll("approved")}
          className="flex-1"
          fullWidth
        />
        <Button
          variant="ghost"
          label="Reject all"
          onPress={() => decideAll("rejected")}
          className="flex-1"
          fullWidth
        />
      </View>
      <View className="gap-3">
        {pending.map((line) => (
          <Card key={line.id} className="gap-3">
            <View className="flex-row justify-between gap-3">
              <View className="flex-1">
                <Text weight="semibold">{line.description}</Text>
                <Text variant="small" tone="muted">
                  {ESTIMATE_KIND_LABELS[line.kind]}
                  {line.isExtra ? " · Extra work" : ""} · {formatNumber(line.quantity)} ×{" "}
                  {formatPrice(line.unitPriceInPaise)}
                </Text>
              </View>
              <Text weight="semibold" tabular>
                {formatPrice(line.unitPriceInPaise * line.quantity)}
              </Text>
            </View>
            <SegmentedChoice
              label={line.description}
              options={[
                { value: "approved", label: "Approve", tone: "success" },
                { value: "rejected", label: "Reject", tone: "danger" },
              ]}
              value={decisions[line.id] ?? null}
              onChange={(decision) =>
                setDecisions((current) => ({ ...current, [line.id]: decision }))
              }
            />
          </Card>
        ))}
      </View>
      <Section title="How they answered">
        <View className="-mx-4">
          <FilterChips
            label="How they answered"
            options={CHANNELS.map((value) => ({ value, label: value }))}
            value={channel}
            onChange={setChannel}
          />
        </View>
      </Section>
      <Card>
        <MoneyTotals {...sumLines([...approvedLines(lines), ...approved])} subject="Approved" />
      </Card>
    </Screen>
  );
}
