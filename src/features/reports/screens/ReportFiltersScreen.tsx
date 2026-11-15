import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { Radio } from "@/components/ui/Radio";
import { Text } from "@/components/ui/Text";
import { useBranches } from "@/features/company/queries";
import { useReportFilters, type ReportRange } from "@/features/reports/filter-store";
import { customRangeSchema, RANGE_LABELS } from "@/features/reports/utils";
import { maskTypedDate, parseTypedDate, toTypedDate } from "@/lib/dates";
import { firstProblem } from "@/lib/validation";

const RANGES = Object.keys(RANGE_LABELS) as ReportRange[];

/** The Reports sheet: which branch (or every branch) and which dates. */
export function ReportFiltersScreen() {
  const saved = useReportFilters();
  const branches = useBranches();
  const insets = useSafeAreaInsets();
  const [branchId, setBranchId] = useState(saved.branchId);
  const [range, setRange] = useState(saved.range);
  const [from, setFrom] = useState(toTypedDate(saved.from));
  const [to, setTo] = useState(toTypedDate(saved.to));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    if (range !== "custom") {
      saved.set({ branchId, range, from: null, to: null });
      return router.back();
    }
    const problem = firstProblem(customRangeSchema, { from, to });
    setError(problem);
    if (problem) return;
    saved.set({ branchId, range, from: parseTypedDate(from), to: parseTypedDate(to) });
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView
        contentContainerClassName="gap-6 px-4 pt-6 pb-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="heading" accessibilityRole="header">
          Report for
        </Text>
        <View className="gap-1" accessibilityRole="radiogroup">
          <Text variant="label" tone="muted" sectionLabel>
            Branch
          </Text>
          <Radio
            label="Every branch"
            selected={branchId === null}
            onSelect={() => setBranchId(null)}
          />
          {(branches.data ?? []).map((branch) => (
            <Radio
              key={branch.id}
              label={branch.name}
              selected={branchId === branch.id}
              onSelect={() => setBranchId(branch.id)}
            />
          ))}
        </View>
        <View className="gap-1" accessibilityRole="radiogroup">
          <Text variant="label" tone="muted" sectionLabel>
            Dates
          </Text>
          {RANGES.map((option) => (
            <Radio
              key={option}
              label={RANGE_LABELS[option]}
              selected={range === option}
              onSelect={() => setRange(option)}
            />
          ))}
        </View>
        {range === "custom" ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <NumberInput
                label="From"
                placeholder="DD/MM/YYYY"
                value={from}
                onChangeText={(text) => {
                  setError(null);
                  setFrom(maskTypedDate(text));
                }}
                error={error ?? undefined}
              />
            </View>
            <View className="flex-1">
              <NumberInput
                label="To"
                placeholder="DD/MM/YYYY"
                value={to}
                onChangeText={(text) => {
                  setError(null);
                  setTo(maskTypedDate(text));
                }}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View className="px-4">
        <Button size="main" label="Show report" onPress={apply} />
      </View>
    </View>
  );
}
