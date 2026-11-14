import { FlashList } from "@shopify/flash-list";
import { FileText, Share2 } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useDocumentPages } from "@/features/documents/queries";
import type { DocumentKind } from "@/features/documents/types";
import { indiaDateIn } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { allItems } from "@/lib/paging";
import { shareRemotePdf } from "@/lib/share-pdf";
import { colors } from "@/lib/theme";
import { useDebounced } from "@/lib/use-debounced";

const KINDS: { value: DocumentKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "invoice", label: "GST invoices" },
  { value: "credit_note", label: "Credit notes" },
];
const PERIODS = [
  { value: "any", label: "Any time" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
] as const;

/** G73: GST invoices and credit notes, by type and date, searchable by number; Share PDF. */
export function DocumentsScreen() {
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["value"]>("any");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [sharingId, setSharingId] = useState<string | null>(null);
  const pages = useDocumentPages({
    kind: kind === "all" ? undefined : kind,
    q: q || undefined,
    from: period === "any" ? undefined : indiaDateIn(-Number(period)),
  });
  const documents = allItems(pages.data?.pages);

  const share = async (id: string, url: string, title: string) => {
    setSharingId(id);
    await shareRemotePdf(url, title);
    setSharingId(null);
  };

  return (
    <Screen scroll={false} header={<Header title="Documents" />}>
      <View className="gap-3 pt-4">
        <View className="px-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Invoice or credit note number"
          />
        </View>
        <FilterChips label="Type" options={KINDS} value={kind} onChange={setKind} />
        <FilterChips label="Date" options={[...PERIODS]} value={period} onChange={setPeriod} />
      </View>
      {pages.isPending ? (
        <View accessible accessibilityLabel="Loading" className="p-4">
          <Skeleton shape="card" className="h-24 w-full" />
        </View>
      ) : pages.isError && documents.length === 0 ? (
        <ErrorState
          error={pages.error}
          onRetry={() => void pages.refetch()}
          what="your documents"
        />
      ) : (
        <FlashList
          data={documents}
          keyExtractor={(document) => document.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onEndReached={() =>
            pages.hasNextPage && !pages.isFetchingNextPage && void pages.fetchNextPage()
          }
          refreshControl={
            <RefreshControl
              refreshing={pages.isRefetching && !pages.isFetchingNextPage}
              onRefresh={() => void pages.refetch()}
              tintColor={colors.navy[700]}
              colors={[colors.navy[700]]}
            />
          }
          renderItem={({ item }) => (
            <Card className="gap-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text weight="semibold">{item.number}</Text>
                <Text variant="small" tone="muted">
                  {item.kind === "invoice" ? "GST invoice" : "Credit note"}
                </Text>
              </View>
              <Text variant="small" tone="muted">
                {formatDate(item.date)} · {formatPrice(item.amountInPaise)} incl. GST
                {item.relatedTo ? ` · ${item.relatedTo.label}` : ""}
              </Text>
              {item.url ? (
                <Button
                  variant="outline"
                  icon={Share2}
                  label="Share PDF"
                  onPress={() => void share(item.id, item.url ?? "", item.number)}
                  loading={sharingId === item.id}
                />
              ) : (
                <Text variant="small" tone="muted">
                  The PDF is being made. Pull down to check again.
                </Text>
              )}
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={FileText}
              title="No documents here"
              message="GST invoices arrive when orders ship; credit notes when returns are refunded."
            />
          }
        />
      )}
    </Screen>
  );
}
