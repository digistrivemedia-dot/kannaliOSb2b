import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useBranchStore } from "@/features/company/branch-store";
import { useBranches } from "@/features/company/queries";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { colors } from "@/lib/theme";

/** G07: owners pick the branch every garage screen follows. A form sheet from the top bar. */
export function BranchSwitcherScreen() {
  const branches = useBranches();
  const active = useActiveBranch();
  const setBranchId = useBranchStore((state) => state.setBranchId);

  return (
    <View className="flex-1 bg-white">
      <Text variant="heading" accessibilityRole="header" className="px-4 pb-2 pt-6">
        Switch branch
      </Text>
      {branches.isPending ? (
        <View className="gap-2 p-4" accessible accessibilityLabel="Loading">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </View>
      ) : branches.isError ? (
        <ErrorState error={branches.error} onRetry={() => void branches.refetch()} what="the branches" />
      ) : (
        <ScrollView contentContainerClassName="pb-8" accessibilityRole="radiogroup">
          {branches.data.map((branch) => {
            const isCurrent = branch.id === active.id;
            return (
              <Pressable
                key={branch.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isCurrent }}
                accessibilityLabel={`${branch.name}, ${branch.address.city}`}
                onPress={() => {
                  setBranchId(branch.id);
                  showToast({ message: `Showing ${branch.name}` });
                  router.back();
                }}
                className="min-h-16 flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
              >
                <View className="flex-1">
                  <Text weight={isCurrent ? "semibold" : "medium"}>
                    {branch.name}
                    {branch.isMain ? " (main)" : ""}
                  </Text>
                  <Text variant="small" tone="muted" numberOfLines={1}>
                    {[branch.address.line1, branch.address.city].join(", ")}
                  </Text>
                </View>
                {isCurrent && <Check size={24} color={colors.navy[700]} />}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
