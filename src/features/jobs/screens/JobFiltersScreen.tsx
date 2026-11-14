import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { useCan } from "@/features/auth/use-can";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { DATE_RANGE_LABELS, useJobFilters, type JobDateRange } from "@/features/jobs/filter-store";
import { useTechnicians } from "@/features/jobs/queries";

const RANGES = Object.keys(DATE_RANGE_LABELS) as JobDateRange[];

/** The job list's Filters sheet: technician and when the job was opened. Kept for next time. */
export function JobFiltersScreen() {
  const saved = useJobFilters();
  const branch = useActiveBranch();
  // The technician list is for whoever assigns technicians; others filter by date only.
  const canSeeTechnicians = useCan("jobs:manage");
  const technicians = useTechnicians(branch.id, { enabled: canSeeTechnicians });
  const insets = useSafeAreaInsets();
  const [technicianId, setTechnicianId] = useState(saved.technicianId);
  const [dateRange, setDateRange] = useState(saved.dateRange);

  const apply = () => {
    saved.set({ technicianId, dateRange });
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView contentContainerClassName="gap-6 px-4 pt-6 pb-4">
        <Text variant="heading" accessibilityRole="header">
          Filters
        </Text>
        {canSeeTechnicians && (
          <View className="gap-1" accessibilityRole="radiogroup">
            <Text variant="label" tone="muted" sectionLabel>
              Technician
            </Text>
            <Radio
              label="Everyone"
              selected={technicianId === null}
              onSelect={() => setTechnicianId(null)}
            />
            {(technicians.data ?? []).map((technician) => (
              <Radio
                key={technician.id}
                label={technician.name}
                description={`${technician.activeJobs} open ${technician.activeJobs === 1 ? "job" : "jobs"}`}
                selected={technicianId === technician.id}
                onSelect={() => setTechnicianId(technician.id)}
              />
            ))}
          </View>
        )}
        <View className="gap-1" accessibilityRole="radiogroup">
          <Text variant="label" tone="muted" sectionLabel>
            Opened
          </Text>
          {RANGES.map((range) => (
            <Radio
              key={range}
              label={DATE_RANGE_LABELS[range]}
              selected={dateRange === range}
              onSelect={() => setDateRange(range)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="gap-2 px-4">
        <Button size="main" label="Show jobs" onPress={apply} />
        <Button
          variant="ghost"
          label="Clear filters"
          fullWidth
          onPress={() => {
            setTechnicianId(null);
            setDateRange("any");
          }}
        />
      </View>
    </View>
  );
}
