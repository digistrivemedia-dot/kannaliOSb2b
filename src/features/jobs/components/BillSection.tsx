import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { Price } from "@/components/ui/Price";
import { NotYet } from "@/features/jobs/components/NotYet";
import { closedText } from "@/features/jobs/next-action";
import type { JobCard } from "@/features/jobs/types";
import { formatDateTime, formatKm, formatPrice } from "@/lib/format";

/** The garage's bill, the payment and the handover. */
export function BillSection({ job, isDone }: { job: JobCard; isDone: boolean }) {
  const { invoice, payment, handover } = job;
  if (!invoice) {
    return (
      <Section title="Bill">
        <NotYet>
          {job.status === "ready"
            ? "Passed the quality check. Ready to bill."
            : job.status === "closed"
              ? `Nothing to bill. ${closedText(job)}.`
              : "The bill is made once the vehicle passes its quality check."}
        </NotYet>
      </Section>
    );
  }
  return (
    <Section title="Bill" isDone={isDone}>
      <Card className="gap-4">
        <DetailRow label={`Bill ${invoice.number} · ${formatDateTime(invoice.issuedAt)}`}>
          <Price paise={invoice.totalInPaise} gst="incl" size="title" />
        </DetailRow>
        <DetailRow label="Payment">
          {payment
            ? `${formatPrice(payment.amountInPaise)} ${payment.method === "cash" ? "in cash" : "online"}, ${formatDateTime(payment.receivedAt)}`
            : "Not paid yet"}
        </DetailRow>
        <DetailRow label="Handover">
          {handover
            ? `${formatDateTime(handover.at)} by ${handover.by.name} · ${formatKm(handover.odometerKm)}`
            : "Not handed over yet"}
        </DetailRow>
      </Card>
    </Section>
  );
}
