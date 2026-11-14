import { router } from "expo-router";
import { Share2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { PlateChip } from "@/components/ui/PlateChip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useCan } from "@/features/auth/use-can";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";
import { billHtml, splitGst } from "@/features/jobs/documents";
import { useCreateInvoice } from "@/features/jobs/queries";
import type { JobCard } from "@/features/jobs/types";
import { useBillingGarage } from "@/features/jobs/use-billing-garage";
import { approvedLines, ESTIMATE_KIND_LABELS, sumLines, vehicleName } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { formatDateTime, formatNumber, formatPhone, formatPrice } from "@/lib/format";
import { sharePdf } from "@/lib/share-pdf";

/** G42: the bill from the approved lines, in the garage's name and GSTIN, with CGST and SGST. */
export function BillScreen() {
  return (
    <WithJob title="Bill">
      {(job) =>
        job.invoice || job.status === "ready" ? (
          <Bill job={job} />
        ) : (
          <StepNotReady
            job={job}
            title="No bill yet"
            message="The bill is made once the vehicle passes its quality check."
          />
        )
      }
    </WithJob>
  );
}

function Bill({ job }: { job: JobCard }) {
  const garage = useBillingGarage(job);
  const canBill = useCan("jobs:billing");
  const create = useCreateInvoice(job.id);
  const [isSharing, setIsSharing] = useState(false);
  const lines = approvedLines(job.estimate?.lines ?? []);
  // Before the bill is made, its totals are worked out from the approved lines, as the server does.
  const totals = job.invoice ?? sumLines(lines);
  const { cgst, sgst } = splitGst(totals.gstInPaise);
  const isUnpaid = Boolean(job.invoice) && !job.payment;

  const share = async () => {
    setIsSharing(true);
    await sharePdf(billHtml(job, garage), `Bill ${job.invoice?.number ?? job.number}`);
    setIsSharing(false);
  };

  const makeBill = () =>
    create.mutate(undefined, {
      onSuccess: (billed) => showToast({ message: `Bill ${billed.invoice?.number ?? ""} made` }),
      onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
    });

  const main = !job.invoice
    ? canBill && { label: "Create bill", onPress: makeBill, loading: create.isPending }
    : isUnpaid && canBill && job.status === "payment_pending"
      ? {
          label: `Collect ${formatPrice(job.invoice.totalInPaise)}`,
          onPress: () =>
            router.push({ pathname: "/job/[id]/collect-payment", params: { id: job.id } }),
          loading: false,
        }
      : null;

  return (
    <Screen
      header={
        <Header title={job.invoice ? `Bill ${job.invoice.number}` : "Bill"} subtitle={job.number} />
      }
      bottomBar={
        <BottomBar>
          {main ? (
            <Button size="main" label={main.label} onPress={main.onPress} loading={main.loading} />
          ) : null}
          {job.invoice ? (
            <Button
              variant={main ? "outline" : "primary"}
              size={main ? "regular" : "main"}
              icon={Share2}
              label="Share PDF"
              onPress={() => void share()}
              loading={isSharing}
              fullWidth
            />
          ) : null}
        </BottomBar>
      }
    >
      <Card className="gap-1">
        <Text variant="heading">
          {garage.business.name}
          {garage.branch ? `, ${garage.branch.name}` : ""}
        </Text>
        {garage.branch ? (
          <Text variant="small" tone="muted">
            {[
              garage.branch.address.line1,
              garage.branch.address.city,
              garage.branch.address.pin,
            ].join(", ")}{" "}
            · {formatPhone(garage.branch.contactPhone)}
          </Text>
        ) : null}
        <Text variant="small" tone="muted">
          {garage.business.gstin ? `GSTIN ${garage.business.gstin}` : "Not GST registered"}
        </Text>
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <DetailRow label="Bill to">
            <Text weight="semibold">{job.customer.name}</Text>
          </DetailRow>
          <StatusBadge status={job.payment ? "paid" : job.invoice ? "payment_pending" : "ready"} />
        </View>
        <View className="flex-row items-center gap-2">
          <PlateChip plate={job.vehicle.plate} />
          <Text tone="muted">{vehicleName(job.vehicle)}</Text>
        </View>
        {job.invoice ? (
          <Text variant="small" tone="muted">
            Made {formatDateTime(job.invoice.issuedAt)}
          </Text>
        ) : (
          <Text variant="small" tone="action" weight="semibold">
            Not made yet. Check the lines, then Create bill.
          </Text>
        )}
      </Card>

      <Section title="Items">
        <Card flush>
          {lines.map((line, index) => (
            <View
              key={line.id}
              className={index ? "gap-1 border-t border-gray-200 p-4" : "gap-1 p-4"}
            >
              <View className="flex-row justify-between gap-3">
                <Text className="flex-1" weight="medium">
                  {line.description}
                </Text>
                <Text weight="semibold" tabular>
                  {formatPrice(line.unitPriceInPaise * line.quantity)}
                </Text>
              </View>
              <Text variant="small" tone="muted" tabular>
                {ESTIMATE_KIND_LABELS[line.kind]} · {formatNumber(line.quantity)} ×{" "}
                {formatPrice(line.unitPriceInPaise)} · GST {line.gstRatePercent}%
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Card className="gap-1.5">
        <TotalRow label="Subtotal (excl. GST)" value={totals.subtotalInPaise} />
        <TotalRow label="CGST" value={cgst} />
        <TotalRow label="SGST" value={sgst} />
        <View className="flex-row items-baseline justify-between border-t border-gray-200 pt-1.5">
          <Text weight="semibold">Total (incl. GST)</Text>
          <Text variant="figure">{formatPrice(totals.totalInPaise)}</Text>
        </View>
        {job.payment ? (
          <Text variant="small" tone="success" weight="medium">
            Paid {formatPrice(job.payment.amountInPaise)}{" "}
            {job.payment.method === "cash" ? "in cash" : "online"},{" "}
            {formatDateTime(job.payment.receivedAt)}
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between">
      <Text variant="small" tone="muted">
        {label}
      </Text>
      <Text variant="small" weight="semibold" tabular>
        {formatPrice(value)}
      </Text>
    </View>
  );
}
