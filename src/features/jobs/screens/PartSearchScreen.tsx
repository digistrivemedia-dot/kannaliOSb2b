import { router } from "expo-router";
import { PackageSearch } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { usePartPick } from "@/features/jobs/part-pick-store";
import { usePartSearch } from "@/features/jobs/queries";
import { formatPrice } from "@/lib/format";
import { useDebounced } from "@/lib/use-debounced";

/** Find a SpareX part (form sheet), for an estimate line or a quotation row. */
export function PartSearchScreen() {
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const results = usePartSearch(q);
  const onPick = usePartPick((state) => state.onPick);

  return (
    <View className="flex-1 bg-white">
      <View className="gap-3 px-4 pb-2 pt-6">
        <Text variant="heading" accessibilityRole="header">
          Find a SpareX part
        </Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Part name or number" />
      </View>
      {q.length < 2 ? (
        <EmptyState
          icon={PackageSearch}
          title="Search by name or part number"
          message="Shown with the MRP. On an estimate, the price is filled in without GST."
        />
      ) : results.isPending ? (
        <View className="gap-2 p-4" accessible accessibilityLabel="Loading">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </View>
      ) : results.isError ? (
        <ErrorState error={results.error} onRetry={() => void results.refetch()} what="the parts" />
      ) : results.data.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No parts match"
          message="Try the part number, or type it in yourself."
        />
      ) : (
        <ScrollView contentContainerClassName="pb-8" keyboardShouldPersistTaps="handled">
          {results.data.map((part) => (
            <Pressable
              key={part.id}
              accessibilityRole="button"
              accessibilityLabel={`${part.name}, ${part.partNumber}, MRP ${formatPrice(part.mrpInPaise)}`}
              onPress={() => {
                onPick(part);
                router.back();
              }}
              className="min-h-16 gap-0.5 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
            >
              <Text weight="medium">{part.name}</Text>
              <Text variant="small" tone="muted">
                {part.partNumber} · {part.brand} · MRP {formatPrice(part.mrpInPaise)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
