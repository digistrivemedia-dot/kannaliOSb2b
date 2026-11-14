import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { NotYet } from "@/features/jobs/components/NotYet";
import type { EstimateLine, JobCard } from "@/features/jobs/types";
import { approvedLines, ESTIMATE_KIND_LABELS, sumLines } from "@/features/jobs/utils";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";

/** Each line with the customer's answer (approved, waiting, rejected), then the approved totals. */
export function EstimateSection({ job, isDone }: { job: JobCard; isDone: boolean }) {
  const { estimate } = job;
  if (!estimate) {
    return (
      <Section title="Estimate">
        <NotYet>No estimate yet. It is made after the inspection.</NotYet>
      </Section>
    );
  }
  const approved = sumLines(approvedLines(estimate.lines));
  const isWaiting = estimate.lines.some((line) => line.approval === "pending");
  return (
    <Section title="Estimate" isDone={isDone}>
      <Card flush>
        {estimate.lines.map((line, index) => (
          <LineRow key={line.id} line={line} divided={index > 0} />
        ))}
        <View className="gap-1.5 border-t border-gray-200 bg-gray-50 p-4">
          <TotalRow label="Approved (excl. GST)" paise={approved.subtotalInPaise} />
          <TotalRow label="GST" paise={approved.gstInPaise} />
          <TotalRow label="Total (incl. GST)" paise={approved.totalInPaise} strong />
          <Text variant="small" tone="muted" className="mt-1">
            {isWaiting
              ? "Lines waiting for the customer aren't counted until they're approved."
              : estimate.decidedAt
                ? `Customer answered ${formatDateTime(estimate.decidedAt)}${estimate.approvalNote ? ` (${estimate.approvalNote.toLowerCase()})` : ""}.`
                : estimate.sentAt
                  ? `Sent to the customer ${formatDateTime(estimate.sentAt)}.`
                  : ""}
          </Text>
        </View>
      </Card>
    </Section>
  );
}

function LineRow({ line, divided }: { line: EstimateLine; divided: boolean }) {
  const meta = [
    ESTIMATE_KIND_LABELS[line.kind],
    line.partNumber,
    line.isExtra ? "Extra work" : undefined,
  ].filter(Boolean);
  return (
    <View className={divided ? "gap-2 border-t border-gray-200 p-4" : "gap-2 p-4"}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text weight="medium">{line.description}</Text>
          <Text variant="small" tone="muted">
            {meta.join(" · ")}
          </Text>
        </View>
        <StatusBadge status={line.approval} />
      </View>
      <View className="flex-row items-baseline justify-between">
        <Text variant="small" tone="muted" tabular>
          {formatNumber(line.quantity)} × {formatPrice(line.unitPriceInPaise)}
        </Text>
        <Text
          weight="semibold"
          tabular
          tone={line.approval === "rejected" ? "muted" : "default"}
          style={line.approval === "rejected" ? { textDecorationLine: "line-through" } : undefined}
        >
          {formatPrice(line.unitPriceInPaise * line.quantity)}
        </Text>
      </View>
    </View>
  );
}

function TotalRow({ label, paise, strong }: { label: string; paise: number; strong?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text
        variant={strong ? "body" : "small"}
        weight={strong ? "semibold" : "regular"}
        tone={strong ? "default" : "muted"}
      >
        {label}
      </Text>
      <Text variant={strong ? "heading" : "small"} weight="semibold" tabular>
        {formatPrice(paise)}
      </Text>
    </View>
  );
}
