import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StepProgress } from "@/components/ui/StepProgress";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useCan } from "@/features/auth/use-can";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import { useSaveInspection } from "@/features/jobs/queries";
import type { InspectionResult, JobCard } from "@/features/jobs/types";
import {
  INSPECTION_CHECKLIST,
  INSPECTION_RESULTS,
  MAX_JOB_PHOTO_BYTES,
} from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { clearDraft, savedDraft, useFormDraft } from "@/lib/drafts";
import { toDataUrls } from "@/lib/photos";

type ItemValues = {
  id: string;
  area: string;
  name: string;
  result: InspectionResult;
  note: string;
  photos: string[];
};
type InspectionValues = { items: ItemValues[] };

const RESULT_OPTIONS = (["ok", "attention", "replace"] as const).map((value) => ({
  value,
  label: INSPECTION_RESULTS[value].word,
  tone: INSPECTION_RESULTS[value].tone,
}));

/** Every item starts as OK (website); an earlier inspection of this job is the starting point when there is one. */
function startingItems(job: JobCard): ItemValues[] {
  return INSPECTION_CHECKLIST.flatMap(({ area, items }) =>
    items.map((name, index) => {
      const id = `${area}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const earlier = job.inspection?.items.find(
        (item) => item.area === area && item.name === name,
      );
      return {
        id,
        area,
        name,
        result: earlier?.result ?? "ok",
        note: earlier?.note ?? "",
        photos: earlier?.photos ?? [],
      };
    }),
  );
}

/** G35: one area per screen ("Brakes, 2 of 6"), each item OK / Needs attention / Replace, then a summary. */
export function InspectionScreen() {
  return (
    <WithJob title="Inspection">
      {(job) =>
        job.status === "job_card_created" || job.status === "inspection" ? (
          <InspectionForm job={job} />
        ) : (
          <StepNotReady
            job={job}
            title={job.inspection ? "Already inspected" : "Check the vehicle in first"}
            message={
              job.inspection
                ? "The estimate has been made from it."
                : "Inspection starts once the vehicle is checked in."
            }
          />
        )
      }
    </WithJob>
  );
}

function InspectionForm({ job }: { job: JobCard }) {
  const draftKey = `inspection:${job.id}`;
  const form = useForm<InspectionValues>({
    defaultValues: savedDraft<InspectionValues>(draftKey) ?? { items: startingItems(job) },
  });
  useFormDraft(draftKey, form);
  const items = useWatch({ control: form.control, name: "items" }) ?? [];
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const save = useSaveInspection(job.id);
  const canEstimate = useCan("jobs:manage");
  const areas = INSPECTION_CHECKLIST.map((group) => group.area);
  const isSummary = step === areas.length;
  const flagged = items.filter((item) => item.result !== "ok");

  const submit = async () => {
    setError(null);
    setIsPreparing(true);
    try {
      const prepared = await Promise.all(
        items.map(async (item) => ({
          id: item.id,
          area: item.area,
          name: item.name,
          result: item.result,
          note: item.result === "ok" ? undefined : item.note.trim() || undefined,
          photos: item.result === "ok" ? [] : await toDataUrls(item.photos, MAX_JOB_PHOTO_BYTES),
        })),
      );
      await save.mutateAsync({ items: prepared });
      clearDraft(draftKey);
      showToast({
        message: flagged.length
          ? `Inspection saved: ${flagged.length} to fix`
          : "Inspection saved: all OK",
      });
      if (canEstimate) router.replace({ pathname: "/job/[id]/estimate", params: { id: job.id } });
      else router.back();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Screen
      header={<Header title="Inspection" subtitle={`${job.vehicle.plate} · ${job.number}`} />}
      bottomBar={
        <BottomBar>
          {isSummary ? (
            <Button
              size="main"
              label={canEstimate ? "Save and build the estimate" : "Save inspection"}
              onPress={() => void submit()}
              loading={isPreparing || save.isPending}
            />
          ) : (
            <Button
              size="main"
              label={step === areas.length - 1 ? "Check the summary" : `Next: ${areas[step + 1]}`}
              onPress={() => setStep(step + 1)}
            />
          )}
          {step > 0 && (
            <Button variant="ghost" label="Back" onPress={() => setStep(step - 1)} fullWidth />
          )}
        </BottomBar>
      }
    >
      <StepProgress
        step={step}
        total={areas.length + 1}
        title={isSummary ? "Summary" : `${areas[step]}, ${step + 1} of ${areas.length}`}
      />
      {error ? <FormAlert message={error} /> : null}
      {isSummary ? (
        <Summary items={items} onOpenArea={(area) => setStep(areas.indexOf(area))} />
      ) : (
        <View className="gap-3">
          {items.map((item, index) =>
            item.area === areas[step] ? (
              <ItemCard
                key={item.id}
                control={form.control}
                index={index}
                name={item.name}
                result={item.result}
              />
            ) : null,
          )}
        </View>
      )}
    </Screen>
  );
}

function ItemCard({
  control,
  index,
  name,
  result,
}: {
  control: Control<InspectionValues>;
  index: number;
  name: string;
  result: InspectionResult;
}) {
  return (
    <Card className="gap-3">
      <Text weight="semibold">{name}</Text>
      <Controller
        control={control}
        name={`items.${index}.result`}
        render={({ field }) => (
          <SegmentedChoice
            label={name}
            options={RESULT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {result !== "ok" && (
        <>
          <Controller
            control={control}
            name={`items.${index}.note`}
            render={({ field }) => (
              <Input
                label="Note"
                placeholder="Pads worn to 2 mm"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name={`items.${index}.photos`}
            render={({ field }) => (
              <PhotoCapture label="Photos" photos={field.value} onChange={field.onChange} max={3} />
            )}
          />
        </>
      )}
    </Card>
  );
}

function Summary({
  items,
  onOpenArea,
}: {
  items: ItemValues[];
  onOpenArea: (area: string) => void;
}) {
  const flagged = items.filter((item) => item.result !== "ok");
  if (flagged.length === 0) {
    return (
      <Card>
        <Text weight="semibold">All {items.length} items are OK.</Text>
        <Text variant="small" tone="muted">
          The estimate starts with the work the customer asked for.
        </Text>
      </Card>
    );
  }
  return (
    <View className="gap-3">
      <Text tone="muted">
        {flagged.length} of {items.length} items need work. Each becomes a line on the estimate.
      </Text>
      {flagged.map((item) => (
        <Card
          key={item.id}
          onPress={() => onOpenArea(item.area)}
          accessibilityLabel={`${item.name}, ${INSPECTION_RESULTS[item.result].word}. Change`}
          className="gap-1"
        >
          <View className="flex-row items-start justify-between gap-2">
            <Text weight="semibold" className="flex-1">
              {item.name}
            </Text>
            <StatusBadge
              word={INSPECTION_RESULTS[item.result].word}
              tone={INSPECTION_RESULTS[item.result].tone}
            />
          </View>
          <Text variant="small" tone="muted">
            {item.area}
            {item.note ? ` · ${item.note}` : ""}
            {item.photos.length
              ? ` · ${item.photos.length} photo${item.photos.length === 1 ? "" : "s"}`
              : ""}
          </Text>
        </Card>
      ))}
    </View>
  );
}
