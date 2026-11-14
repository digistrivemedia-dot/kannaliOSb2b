import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Radio } from "@/components/ui/Radio";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useOrder } from "@/features/orders/queries";
import { useCreateReturn, useReturnedQuantities } from "@/features/returns/queries";
import type { ReturnReason } from "@/features/returns/types";
import { MAX_RETURN_PHOTO_BYTES, RETURN_REASONS } from "@/features/returns/utils";
import { errorMessage } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { toDataUrls } from "@/lib/photos";

const REASONS = Object.keys(RETURN_REASONS) as ReturnReason[];

/** G59 (request): which parts and how many, the reason, photos and a note, for a delivered order. */
export function ReturnRequestScreen() {
  const id = useSafeParam("id");
  const order = useOrder(id);
  const returned = useReturnedQuantities(id);
  const create = useCreateReturn();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ReturnReason | null>(null);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const lines = (order.data?.items ?? []).map((item) => ({
    ...item,
    returnable: item.quantity - (returned.data?.[item.productId] ?? 0),
  }));
  const chosen = Object.entries(quantities).filter(([, quantity]) => quantity > 0);

  const send = async () => {
    if (!order.data) return;
    if (chosen.length === 0) return setError("Choose what you're returning.");
    if (!reason) return setError("Choose why.");
    setError(null);
    setIsPreparing(true);
    try {
      const request = await create.mutateAsync({
        orderId: order.data.id,
        reason,
        notes: notes.trim() || undefined,
        photos: await toDataUrls(photos, MAX_RETURN_PHOTO_BYTES),
        items: chosen.map(([productId, quantity]) => ({ productId, quantity })),
      });
      showToast({ message: `Return ${request.number} requested` });
      router.replace({ pathname: "/return/[id]", params: { id: request.id } });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Screen
      header={
        <Header
          title="Return items"
          subtitle={order.data ? `Order ${order.data.number}` : undefined}
        />
      }
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label="Request the return"
            onPress={() => void send()}
            loading={isPreparing || create.isPending}
            disabled={!order.data}
          />
        </BottomBar>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      {order.isPending || returned.isPending ? (
        <Skeleton shape="card" className="h-40 w-full" />
      ) : (
        <Section title="What are you returning?">
          <View className="gap-3">
            {lines.map((line) => (
              <Card key={line.productId} className="gap-2">
                <Text weight="semibold">{line.name}</Text>
                <Text variant="small" tone="muted">
                  {line.partNumber} · {formatPrice(line.unitPriceInPaise)} each excl. GST ·{" "}
                  {line.returnable > 0
                    ? `${line.returnable} can be returned`
                    : "already being returned"}
                </Text>
                {line.returnable > 0 && (
                  <QuantityStepper
                    value={quantities[line.productId] ?? 0}
                    min={0}
                    max={line.returnable}
                    onChange={(quantity) =>
                      setQuantities((current) => ({ ...current, [line.productId]: quantity }))
                    }
                    label={`Quantity of ${line.name} to return`}
                  />
                )}
              </Card>
            ))}
          </View>
        </Section>
      )}
      <Section title="Why?">
        <View accessibilityRole="radiogroup">
          {REASONS.map((value) => (
            <Radio
              key={value}
              label={RETURN_REASONS[value]}
              selected={reason === value}
              onSelect={() => setReason(value)}
            />
          ))}
        </View>
      </Section>
      <PhotoCapture
        label="Photos of the parts (optional)"
        photos={photos}
        onChange={setPhotos}
        max={4}
      />
      <Input
        label="Note (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={1000}
      />
    </Screen>
  );
}
