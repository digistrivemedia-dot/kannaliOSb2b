import { ClipboardPaste, Plus, X } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import type { PartRow, RowCheck } from "@/features/quick-order/use-part-rows";
import { formatPrice } from "@/lib/format";
import { colors, fonts } from "@/lib/theme";

type PartNumberRowsProps = {
  rows: { row: PartRow; check: RowCheck }[];
  update: (id: string, change: Partial<PartRow>) => void;
  remove: (id: string) => void;
  addRow: () => void;
  paste: (text: string) => void;
};

const CHECK_BADGE: Record<
  RowCheck["status"],
  { word: string; tone: "success" | "warning" | "danger" | "neutral" } | null
> = {
  empty: null,
  checking: { word: "Checking", tone: "neutral" },
  not_found: { word: "Not found", tone: "danger" },
  out_of_stock: { word: "Out of stock", tone: "danger" },
  limited_stock: { word: "Limited stock", tone: "warning" },
  ready: { word: "OK", tone: "success" },
};

/** One row per part number with its quantity, each showing OK / not found / out of stock / only N left. */
export function PartNumberRows({ rows, update, remove, addRow, paste }: PartNumberRowsProps) {
  const [isPasting, setIsPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  return (
    <View className="gap-3">
      {isPasting ? (
        <Card className="gap-3">
          <Input
            label="Paste part numbers, one per line, with the quantity"
            placeholder={"AMA93795 4\nBAJ74934, 6"}
            value={pasted}
            onChangeText={setPasted}
            multiline
            autoCapitalize="characters"
            autoCorrect={false}
            numberOfLines={5}
          />
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              label="Add these rows"
              onPress={() => {
                paste(pasted);
                setPasted("");
                setIsPasting(false);
              }}
              className="flex-1"
              fullWidth
            />
            <Button variant="ghost" label="Cancel" onPress={() => setIsPasting(false)} />
          </View>
        </Card>
      ) : (
        <Button
          variant="outline"
          icon={ClipboardPaste}
          label="Paste a list"
          onPress={() => setIsPasting(true)}
        />
      )}
      {rows.map(({ row, check }, index) => {
        const badge = CHECK_BADGE[check.status];
        const product = "product" in check ? check.product : null;
        return (
          <Card key={row.id} className="gap-2">
            <View className="flex-row items-center gap-2">
              <TextInput
                value={row.partNumber}
                onChangeText={(partNumber) =>
                  update(row.id, { partNumber: partNumber.toUpperCase() })
                }
                placeholder="Part number"
                placeholderTextColor={colors.gray[500]}
                accessibilityLabel={`Part number, row ${index + 1}`}
                autoCapitalize="characters"
                autoCorrect={false}
                className="min-h-12 flex-1 rounded-input border border-gray-300 bg-white px-3 text-gray-900"
                style={{ fontFamily: fonts.semibold, fontSize: 16 }}
              />
              <IconButton
                icon={X}
                label={`Remove row ${index + 1}`}
                onPress={() => remove(row.id)}
              />
            </View>
            <View className="flex-row items-center justify-between gap-2">
              <QuantityStepper
                value={row.quantity}
                onChange={(quantity) => update(row.id, { quantity })}
                label={`Quantity, row ${index + 1}`}
              />
              {badge ? <StatusBadge word={badge.word} tone={badge.tone} /> : null}
            </View>
            {product ? (
              <Text variant="small" tone="muted" numberOfLines={2}>
                {product.name} · {formatPrice(product.businessPriceInPaise)} excl. GST
              </Text>
            ) : null}
            {"message" in check ? (
              <Text variant="small" tone={check.status === "limited_stock" ? "warning" : "danger"}>
                {check.message}
              </Text>
            ) : null}
          </Card>
        );
      })}
      <Button variant="ghost" icon={Plus} label="Add a row" onPress={addRow} />
    </View>
  );
}
