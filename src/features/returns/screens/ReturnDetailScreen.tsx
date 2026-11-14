import { router } from "expo-router";
import { Undo2 } from "lucide-react-native";
import { View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { Timeline } from "@/components/ui/Timeline";
import { useReturn } from "@/features/returns/queries";
import { REFUND_METHODS, RETURN_REASONS } from "@/features/returns/utils";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { statusTone } from "@/lib/status";

/** G59 (detail): the parts, the reason, the refund, and what has happened so far. */
export function ReturnDetailScreen() {
  const id = useSafeParam("id");
  const query = useReturn(id);
  const request = query.data;
  return (
    <Screen
      header={<Header title={request ? `Return ${request.number}` : "Return"} />}
      onRefresh={request ? query.refetch : undefined}
    >
      {query.isPending && id !== null ? (
        <Skeleton shape="card" className="h-40 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="this return" />
      ) : !request ? (
        <EmptyState
          icon={Undo2}
          title="Return not found"
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      ) : (
        <>
          <Card className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text variant="heading">{formatPrice(request.refundInPaise)}</Text>
              <StatusBadge status={request.status} />
            </View>
            <Text tone="muted">
              To come back incl. GST, {REFUND_METHODS[request.refundMethod].toLowerCase()}, once
              Kannali has the parts.
            </Text>
            <Text variant="small" tone="muted">
              Order {request.order.number} · {RETURN_REASONS[request.reason]}
            </Text>
            {request.rejectionReason ? (
              <Text tone="danger">Turned down: {request.rejectionReason}</Text>
            ) : null}
          </Card>
          <Section title="Parts">
            <Card className="gap-2">
              {request.items.map((item) => (
                <Text key={item.productId}>
                  • {item.name} × {formatNumber(item.quantity)}
                </Text>
              ))}
              {request.notes ? <Text tone="muted">{request.notes}</Text> : null}
              <PhotoGallery photos={request.photos} label="Return photo" />
            </Card>
          </Section>
          <Section title="Progress">
            <Card>
              <Timeline
                steps={request.timeline.map((event, index) => ({
                  label: statusTone(event.status).word,
                  when: formatDateTime(event.at),
                  note: event.note,
                  state:
                    event.status === "rejected"
                      ? "stopped"
                      : index === request.timeline.length - 1 && event.status !== "refunded"
                        ? "current"
                        : "done",
                }))}
              />
            </Card>
          </Section>
        </>
      )}
    </Screen>
  );
}
