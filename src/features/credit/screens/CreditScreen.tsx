import { router } from "expo-router";
import { CreditCard, Share2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { UsageBar } from "@/components/ui/UsageBar";
import { useSession } from "@/features/auth/store";
import { useCan } from "@/features/auth/use-can";
import { useCreditInvoices, useCreditSummary, useStatement } from "@/features/credit/queries";
import { statementHtml } from "@/features/credit/statement-html";
import type { Invoice } from "@/features/credit/types";
import { indiaDateIn } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { sharePdf, shareRemotePdf } from "@/lib/share-pdf";

const PERIODS = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last year" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

/** G70: limit, used and available, what's overdue first, the dues to pay, and the statement. Only when credit is on. */
export function CreditScreen() {
  const { business } = useSession();
  const canPay = useCan("credit:pay");
  const summary = useCreditSummary({ enabled: business.creditEnabled });
  const dues = useCreditInvoices("unpaid", { enabled: business.creditEnabled });
  const [period, setPeriod] = useState<Period>("30");
  const from = indiaDateIn(-Number(period));
  const to = indiaDateIn(0);
  const statement = useStatement(from, to, { enabled: business.creditEnabled });
  const [isSharing, setIsSharing] = useState(false);

  if (!business.creditEnabled) {
    return (
      <Screen header={<Header title="Credit" />}>
        <EmptyState
          icon={CreditCard}
          title="Credit isn't on for your business"
          message="Kannali's sales team can set up credit; ask them when they call."
        />
      </Screen>
    );
  }

  const overdue = (dues.data ?? []).filter((invoice) => invoice.status === "overdue");
  const due = (dues.data ?? []).filter((invoice) => invoice.status !== "overdue");
  const owed = (dues.data ?? []).reduce((total, invoice) => total + invoice.balanceInPaise, 0);

  const shareStatement = async () => {
    if (!statement.data) return;
    setIsSharing(true);
    await sharePdf(
      statementHtml(statement.data, business.name, `${formatDate(from)} to ${formatDate(to)}`),
      "Credit statement",
    );
    setIsSharing(false);
  };

  return (
    <Screen
      header={<Header title="Credit" />}
      onRefresh={() => Promise.all([summary.refetch(), dues.refetch(), statement.refetch()])}
      bottomBar={
        canPay && owed > 0 ? (
          <BottomBar>
            <Button
              size="main"
              label={`Pay dues · ${formatPrice(owed)}`}
              onPress={() => router.push("/pay-dues")}
            />
          </BottomBar>
        ) : undefined
      }
    >
      {summary.isPending ? (
        <Skeleton shape="card" className="h-36 w-full" />
      ) : summary.isError ? (
        <ErrorState
          error={summary.error}
          onRetry={() => void summary.refetch()}
          what="your credit"
        />
      ) : (
        <Card className="gap-3">
          <Text variant="label" tone="muted" sectionLabel>
            Available
          </Text>
          <Text variant="figure">{formatPrice(summary.data.availableInPaise)}</Text>
          <UsageBar
            used={summary.data.usedInPaise}
            limit={summary.data.limitInPaise}
            label="Credit used"
          />
          <Text variant="small" tone="muted">
            {formatPrice(summary.data.usedInPaise)} used of {formatPrice(summary.data.limitInPaise)}{" "}
            · {summary.data.termsDays} days to pay
          </Text>
          {summary.data.nextDue ? (
            <Text variant="small" weight="medium">
              Next due {formatPrice(summary.data.nextDue.amountInPaise)} on{" "}
              {formatDate(summary.data.nextDue.date)}
            </Text>
          ) : null}
        </Card>
      )}

      {overdue.length > 0 && (
        <Section title={`Overdue (${overdue.length})`}>
          <View className="gap-3">
            {overdue.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} canPay={canPay} />
            ))}
          </View>
        </Section>
      )}

      <Section title="Due">
        {dues.isPending ? (
          <Skeleton shape="card" className="h-24 w-full" />
        ) : due.length ? (
          <View className="gap-3">
            {due.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} canPay={canPay} />
            ))}
          </View>
        ) : (
          <Card>
            <Text tone="muted">
              {overdue.length
                ? "Nothing else is due."
                : "Nothing is due. Credit orders are invoiced when they ship."}
            </Text>
          </Card>
        )}
      </Section>

      <Section title="Statement">
        <View className="-mx-4">
          <FilterChips
            label="Statement period"
            options={[...PERIODS]}
            value={period}
            onChange={setPeriod}
          />
        </View>
        <Card className="gap-2">
          {statement.data ? (
            <>
              <Row
                label="Opening balance"
                value={formatPrice(statement.data.openingBalanceInPaise)}
              />
              {statement.data.entries.map((entry) => (
                <Row
                  key={entry.id}
                  label={`${formatDate(entry.date)} · ${entry.reference}`}
                  value={
                    entry.debitInPaise
                      ? `+${formatPrice(entry.debitInPaise)}`
                      : `−${formatPrice(entry.creditInPaise)}`
                  }
                />
              ))}
              <Row
                label="Closing balance"
                value={formatPrice(statement.data.closingBalanceInPaise)}
                strong
              />
              <Button
                variant="outline"
                icon={Share2}
                label="Share PDF"
                onPress={() => void shareStatement()}
                loading={isSharing}
              />
            </>
          ) : (
            <Skeleton className="h-16 w-full" />
          )}
        </Card>
      </Section>
    </Screen>
  );
}

function InvoiceRow({ invoice, canPay }: { invoice: Invoice; canPay: boolean }) {
  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold">{invoice.number}</Text>
        <StatusBadge status={invoice.status} />
      </View>
      <Text variant="small" tone="muted">
        {invoice.order ? `Order ${invoice.order.number} · ` : ""}due {formatDate(invoice.dueDate)}
      </Text>
      <Text weight="semibold" tabular>
        {formatPrice(invoice.balanceInPaise)} to pay
        {invoice.awaitingConfirmationInPaise
          ? ` (${formatPrice(invoice.awaitingConfirmationInPaise)} waiting for Kannali to confirm)`
          : ""}
      </Text>
      <View className="flex-row gap-2">
        {canPay && (
          <Button
            variant="secondary"
            label="Pay"
            onPress={() => router.push({ pathname: "/pay-dues", params: { invoice: invoice.id } })}
            className="flex-1"
            fullWidth
          />
        )}
        <Button
          variant="outline"
          icon={Share2}
          label="PDF"
          onPress={() => void shareRemotePdf(invoice.pdfUrl, `Invoice ${invoice.number}`)}
        />
      </View>
    </Card>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text
        variant="small"
        tone={strong ? "default" : "muted"}
        weight={strong ? "semibold" : "regular"}
        className="flex-1"
      >
        {label}
      </Text>
      <Text variant="small" weight="semibold" tabular>
        {value}
      </Text>
    </View>
  );
}
