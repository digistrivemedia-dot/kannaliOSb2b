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
import { NumberInput } from "@/components/ui/NumberInput";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { PlateChip } from "@/components/ui/PlateChip";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import { useHandOver } from "@/features/jobs/queries";
import { handoverSchema } from "@/features/jobs/schemas";
import type { JobCard } from "@/features/jobs/types";
import { MAX_JOB_PHOTO_BYTES, vehicleName } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { indiaDateIn, maskTypedDate, parseTypedDate, toTypedDate } from "@/lib/dates";
import { clearDraft, useDraftStore } from "@/lib/drafts";
import { formatNumber, formatPrice } from "@/lib/format";
import { toDataUrls } from "@/lib/photos";
import { firstProblem } from "@/lib/validation";

/** Website `HandoverForm`. */
const CHECKLIST = [
  "Vehicle returned to the customer",
  "Old parts shown or handed back",
  "Belongings in the vehicle returned",
  "Bill and completion report shared",
];
/** Suggested next service: in 3 months or 3,000 km, whichever comes first. */
const NEXT_SERVICE_DAYS = 90;
const NEXT_SERVICE_KM = 3000;

type Draft = {
  checklist: boolean[];
  odometer: string;
  nextDate: string;
  nextKm: string;
  photos: string[];
  cash: string;
};

/** G44: the handover checklist, odometer out, photos and next service → Completed. Also the driver's "Delivered". */
export function HandoverScreen() {
  return (
    <WithJob title="Hand over">
      {(job) =>
        job.status === "paid" || job.status === "out_for_delivery" ? (
          <HandoverForm job={job} />
        ) : (
          <StepNotReady
            job={job}
            title={job.status === "completed" ? "Already handed over" : "Not ready to hand over"}
            message={
              job.status === "completed"
                ? "This job is complete."
                : "The vehicle goes back once its bill is paid, or with the delivery driver."
            }
          />
        )
      }
    </WithJob>
  );
}

function HandoverForm({ job }: { job: JobCard }) {
  const isDelivery = job.status === "out_for_delivery";
  const cashDue = isDelivery && !job.payment ? job.invoice?.totalInPaise : undefined;
  const draftKey = `handover:${job.id}`;
  const startOdometer = job.checkIn?.odometerKm;
  const draft = useDraftStore((state) => state.drafts[draftKey] as Draft | undefined) ?? {
    checklist: CHECKLIST.map(() => false),
    odometer: startOdometer ? String(startOdometer) : "",
    nextDate: toTypedDate(indiaDateIn(NEXT_SERVICE_DAYS)),
    nextKm: startOdometer ? String(startOdometer + NEXT_SERVICE_KM) : "",
    photos: [],
    cash: "",
  };
  const save = (next: Partial<Draft>) =>
    useDraftStore.getState().save(draftKey, { ...draft, ...next });
  const handOver = useHandOver(job.id);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const cashInPaise = Math.round(Number(draft.cash || 0) * 100);

  const submit = async () => {
    const problem = firstProblem(handoverSchema(cashDue), { ...draft, cashInPaise });
    setError(problem);
    if (problem) return;
    const nextDate = draft.nextDate ? parseTypedDate(draft.nextDate) : null;
    setIsPreparing(true);
    try {
      await handOver.mutateAsync({
        odometerKm: Number(draft.odometer),
        checklist: CHECKLIST.map((label, index) => ({
          label,
          isDone: Boolean(draft.checklist[index]),
        })),
        ...(cashDue !== undefined ? { cashAtDoorInPaise: cashInPaise } : {}),
        nextService: {
          ...(nextDate ? { date: nextDate } : {}),
          ...(draft.nextKm ? { odometerKm: Number(draft.nextKm) } : {}),
        },
        photos: await toDataUrls(draft.photos, MAX_JOB_PHOTO_BYTES),
      });
      clearDraft(draftKey);
      showToast({
        message: isDelivery ? "Delivered. Job completed." : "Handed over. Job completed.",
      });
      router.back();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Screen
      header={<Header title={isDelivery ? "Record delivery" : "Hand over"} subtitle={job.number} />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={isDelivery ? "Delivered" : "Hand over"}
            onPress={() => void submit()}
            loading={isPreparing || handOver.isPending}
          />
        </BottomBar>
      }
    >
      <View className="flex-row items-center gap-3">
        <PlateChip plate={job.vehicle.plate} />
        <Text weight="semibold" className="flex-1" numberOfLines={1}>
          {vehicleName(job.vehicle)} · {job.customer.name}
        </Text>
      </View>
      {error ? <FormAlert message={error} /> : null}
      {cashDue !== undefined ? (
        <Card className="gap-2 border-warning-500 bg-warning-50">
          <Text weight="semibold">
            The bill isn’t paid. Collect {formatPrice(cashDue)} incl. GST in cash.
          </Text>
          <NumberInput
            label="Cash received"
            prefix="₹"
            decimals
            value={draft.cash}
            onChangeText={(cash) => save({ cash })}
          />
          {draft.cash && cashInPaise >= cashDue ? (
            <Text weight="semibold" tone="success">
              Give back {formatPrice(cashInPaise - cashDue)}
            </Text>
          ) : null}
        </Card>
      ) : null}
      <Section title="Checklist">
        <Card className="gap-1">
          {CHECKLIST.map((label, index) => (
            <Checkbox
              key={label}
              label={label}
              checked={Boolean(draft.checklist[index])}
              onChange={(checked) =>
                save({
                  checklist: draft.checklist.map((value, i) => (i === index ? checked : value)),
                })
              }
            />
          ))}
        </Card>
      </Section>
      <NumberInput
        label="Odometer out"
        suffix="km"
        value={draft.odometer}
        onChangeText={(odometer) => save({ odometer: odometer.slice(0, 7) })}
      />
      <PhotoCapture
        label="The vehicle as it leaves"
        photos={draft.photos}
        onChange={(photos) => save({ photos })}
        max={4}
      />
      <Section title="Next service due">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Date"
              placeholder="DD/MM/YYYY"
              keyboardType="number-pad"
              value={draft.nextDate}
              onChangeText={(text) => save({ nextDate: maskTypedDate(text) })}
            />
          </View>
          <View className="flex-1">
            <NumberInput
              label="Or at"
              suffix="km"
              value={draft.nextKm}
              onChangeText={(nextKm) => save({ nextKm: nextKm.slice(0, 7) })}
            />
          </View>
        </View>
        <Text variant="small" tone="muted">
          Suggested: in 3 months or {formatNumber(NEXT_SERVICE_KM)} km, whichever comes first.
        </Text>
      </Section>
    </Screen>
  );
}
