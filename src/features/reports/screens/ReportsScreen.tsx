import { router } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import { View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CountTile } from "@/components/ui/CountTile";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { useBranches } from "@/features/company/queries";
import { useReportFilters } from "@/features/reports/filter-store";
import { useBranchReport } from "@/features/reports/queries";
import type { BranchReport } from "@/features/reports/types";
import { describeRange, rangeDates } from "@/features/reports/utils";
import { formatPrice, toIndiaDate } from "@/lib/format";

/** G85 (owners): a branch's key numbers for a date range, as tiles and short lists. No wide tables. */
export function ReportsScreen() {
  const choice = useReportFilters();
  const branches = useBranches();
  const dates = rangeDates(choice.range, toIndiaDate(new Date()), choice);
  const report = useBranchReport({ branchId: choice.branchId ?? undefined, ...dates });
  const branchName = choice.branchId
    ? (branches.data?.find((branch) => branch.id === choice.branchId)?.name ?? "")
    : "Every branch";

  return (
    <Screen
      header={
        <Header
          title="Reports"
          subtitle={`${branchName} · ${describeRange(choice.range, dates)}`}
        />
      }
      onRefresh={report.refetch}
    >
      <Button
        variant="outline"
        icon={SlidersHorizontal}
        label="Change branch or dates"
        onPress={() => router.push("/reports-filters")}
      />
      {report.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <View className="flex-row gap-3">
            <CountTile label="Jobs completed" count={0} loading />
            <CountTile label="Revenue, incl. GST" count={0} loading />
          </View>
          <Skeleton shape="card" className="h-40 w-full" />
        </View>
      ) : report.isError ? (
        <ErrorState error={report.error} onRetry={() => void report.refetch()} what="this report" />
      ) : (
        <ReportBody report={report.data} />
      )}
    </Screen>
  );
}

function ReportBody({ report }: { report: BranchReport }) {
  const openJobs = report.openByStatus.reduce((total, row) => total + row.count, 0);
  return (
    <>
      <View className="gap-3">
        <View className="flex-row gap-3">
          <CountTile label="Jobs completed" count={report.jobsCompleted} />
          <CountTile label="Revenue, incl. GST" count={formatPrice(report.revenueInPaise)} />
        </View>
        <View className="flex-row gap-3">
          <CountTile
            label="Average job, incl. GST"
            count={formatPrice(report.averageJobValueInPaise)}
          />
          <CountTile label="Jobs open now" count={openJobs} onPress={() => router.push("/jobs")} />
        </View>
      </View>
      <Section title="Open jobs by status">
        <Card className="gap-3">
          {report.openByStatus.length === 0 ? (
            <Text tone="muted">No open jobs.</Text>
          ) : (
            [...report.openByStatus]
              .sort((a, b) => b.count - a.count)
              .map((row) => (
                <View key={row.status} className="flex-row items-center justify-between">
                  <StatusBadge status={row.status} />
                  <Text weight="semibold" tabular>
                    {row.count}
                  </Text>
                </View>
              ))
          )}
        </Card>
      </Section>
      <Section title="Technicians">
        <Card className="gap-3">
          {report.technicians.length === 0 ? (
            <Text tone="muted">No technicians at this branch.</Text>
          ) : (
            report.technicians.map((technician) => (
              <View key={technician.id} className="gap-0.5">
                <Text weight="medium">{technician.name}</Text>
                <Text variant="small" tone="muted" tabular>
                  {technician.completed} completed · {technician.active} open now
                </Text>
              </View>
            ))
          )}
        </Card>
      </Section>
      <Section title="Top services, incl. GST">
        <Card className="gap-3">
          {report.topServices.length === 0 ? (
            <Text tone="muted">No services billed in these dates.</Text>
          ) : (
            report.topServices.map((service) => (
              <View key={service.name} className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text weight="medium">{service.name}</Text>
                  <Text variant="small" tone="muted" tabular>
                    {service.count} {service.count === 1 ? "time" : "times"}
                  </Text>
                </View>
                <Text weight="semibold" tabular>
                  {formatPrice(service.revenueInPaise)}
                </Text>
              </View>
            ))
          )}
        </Card>
      </Section>
    </>
  );
}
