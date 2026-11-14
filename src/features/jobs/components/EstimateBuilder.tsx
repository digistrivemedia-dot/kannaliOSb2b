import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { showToast } from "@/components/ui/Toast";
import { useCan } from "@/features/auth/use-can";
import { EstimateLineEditor } from "@/features/jobs/components/EstimateLineEditor";
import { MoneyTotals } from "@/features/jobs/components/MoneyTotals";
import {
  estimateSchema,
  newEstimateLine,
  startingLines,
  sumDraftLines,
  toLineInput,
  type EstimateValues,
} from "@/features/jobs/estimate";
import { useGarageServices, useSendEstimate, useSendRevision } from "@/features/jobs/queries";
import type { JobCard } from "@/features/jobs/types";
import { isFixedLine } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { clearDraft, savedDraft, useFormDraft } from "@/lib/drafts";

type EstimateBuilderProps = {
  job: JobCard;
  /** "revision" adds extra work to an estimate the customer already answered (G38). */
  mode: "first" | "revision";
  /** Shown above the lines, e.g. the work already approved. */
  intro?: ReactNode;
};

/** G36 / G38: estimate lines as cards, live totals, and Send to customer. */
export function EstimateBuilder({ job, mode, intro }: EstimateBuilderProps) {
  const draftKey = `estimate:${mode}:${job.id}`;
  const form = useForm<EstimateValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: savedDraft<EstimateValues>(draftKey) ?? {
      lines: mode === "first" ? startingLines(job) : [newEstimateLine("labour")],
    },
  });
  useFormDraft(draftKey, form);
  const { control, handleSubmit, setValue, formState } = form;
  // Lines have their own "id" (sent to the API), so the list keeps its row keys under another name.
  const { fields, append, remove } = useFieldArray({ control, name: "lines", keyName: "rowKey" });
  const lines = useWatch({ control, name: "lines" }) ?? [];
  const totals = sumDraftLines(lines);
  const services = useGarageServices({ enabled: useCan("garage:setup") });
  const canSearchParts = useCan("catalog:view");
  const send = useSendEstimate(job.id);
  const revise = useSendRevision(job.id);
  const [formError, setFormError] = useState<string | null>(null);
  const isSending = send.isPending || revise.isPending;

  const submit = handleSubmit((values) => {
    setFormError(null);
    const mutation = mode === "first" ? send : revise;
    mutation.mutate(values.lines.map(toLineInput), {
      onSuccess: () => {
        clearDraft(draftKey);
        showToast({
          message:
            mode === "first" ? "Estimate sent to the customer" : "Extra work sent for approval",
        });
        router.back();
      },
      onError: (error) => setFormError(errorMessage(error)),
    });
  });

  return (
    <Screen
      header={
        <Header
          title={mode === "first" ? "Estimate" : "Extra work"}
          subtitle={`${job.vehicle.plate} · ${job.number}`}
        />
      }
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={mode === "first" ? "Send to customer" : "Send extra work for approval"}
            onPress={submit}
            loading={isSending}
          />
        </BottomBar>
      }
    >
      {formError || formState.errors.lines?.root?.message ? (
        <FormAlert message={formError ?? formState.errors.lines?.root?.message ?? ""} />
      ) : null}
      {intro}
      <Section title={mode === "first" ? "Lines" : "New work"}>
        <View className="gap-3">
          {fields.map((field, index) => (
            <EstimateLineEditor
              key={field.rowKey}
              control={control}
              setValue={setValue}
              index={index}
              isFixed={isFixedLine(job.id, lines[index]?.id ?? "")}
              services={services.data ?? null}
              canSearchParts={canSearchParts}
              onRemove={() => remove(index)}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            icon={Plus}
            label="Service"
            onPress={() => append(newEstimateLine("service"))}
          />
          <Button
            variant="outline"
            icon={Plus}
            label="Part"
            onPress={() => append(newEstimateLine("part"))}
          />
          <Button
            variant="outline"
            icon={Plus}
            label="Labour"
            onPress={() => append(newEstimateLine("labour"))}
          />
          <Button
            variant="outline"
            icon={Plus}
            label="Consumable"
            onPress={() => append(newEstimateLine("consumable"))}
          />
        </View>
      </Section>
      <Card>
        <MoneyTotals {...totals} subject={mode === "first" ? "Estimate" : "Extra work"} />
      </Card>
    </Screen>
  );
}
