import { router } from "expo-router";
import { Lock, Search, Trash2 } from "lucide-react-native";
import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChips } from "@/components/ui/FilterChips";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SelectField } from "@/components/ui/SelectField";
import { Text } from "@/components/ui/Text";
import { GST_RATES, type EstimateValues } from "@/features/jobs/estimate";
import { usePartPick } from "@/features/jobs/part-pick-store";
import type { EstimateLineKind, GarageService } from "@/features/jobs/types";
import { ESTIMATE_KIND_LABELS } from "@/features/jobs/utils";
import { formatPrice } from "@/lib/format";
import { colors } from "@/lib/theme";

const KINDS = Object.keys(ESTIMATE_KIND_LABELS) as EstimateLineKind[];

type EstimateLineEditorProps = {
  control: Control<EstimateValues>;
  setValue: UseFormSetValue<EstimateValues>;
  index: number;
  /** Booked packages and the pick-up fee: the server fixes their price, so only the quantity shows. */
  isFixed: boolean;
  /** The garage's price list, for owners; others type the service. */
  services: GarageService[] | null;
  /** Whether this user may search the SpareX catalogue (`catalog:view`). */
  canSearchParts: boolean;
  onRemove: () => void;
};

/** One estimate line as a card: what it is, how many, the price excl. GST and its GST rate. */
export function EstimateLineEditor({
  control,
  setValue,
  index,
  isFixed,
  services,
  canSearchParts,
  onRemove,
}: EstimateLineEditorProps) {
  const line = useWatch({ control, name: `lines.${index}` });
  const openPartSearch = usePartPick((state) => state.open);
  const lineTotal = Math.round((Number(line?.price) || 0) * 100) * (Number(line?.quantity) || 0);

  if (isFixed) {
    return (
      <Card className="gap-1">
        <View className="flex-row items-center gap-2">
          <Lock size={16} color={colors.gray[600]} />
          <Text weight="semibold" className="flex-1">
            {line?.description}
          </Text>
          <Text weight="semibold" tabular>
            {formatPrice(lineTotal)}
          </Text>
        </View>
        <Text variant="small" tone="muted">
          Booked by the customer at this price (excl. GST). It can’t be changed.
        </Text>
      </Card>
    );
  }

  const pickPart = () => {
    openPartSearch((part) => {
      setValue(`lines.${index}.description`, part.name, { shouldValidate: true });
      setValue(`lines.${index}.partNumber`, part.partNumber);
      // Garages sell parts on at MRP; the estimate shows prices excluding GST.
      setValue(
        `lines.${index}.price`,
        String(Math.round(part.mrpInPaise / (1 + part.gstRatePercent / 100)) / 100),
        { shouldValidate: true },
      );
      const rate = String(part.gstRatePercent);
      if ((GST_RATES as readonly string[]).includes(rate))
        setValue(`lines.${index}.gst`, rate as EstimateValues["lines"][number]["gst"]);
    });
    router.push("/part-search");
  };

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold">Line {index + 1}</Text>
        <IconButton icon={Trash2} label={`Remove line ${index + 1}`} onPress={onRemove} />
      </View>
      <Controller
        control={control}
        name={`lines.${index}.kind`}
        render={({ field }) => (
          <View className="-mx-4">
            <FilterChips
              label="Kind of line"
              options={KINDS.map((kind) => ({ value: kind, label: ESTIMATE_KIND_LABELS[kind] }))}
              value={field.value}
              onChange={field.onChange}
            />
          </View>
        )}
      />
      {line?.kind === "service" && services && services.length > 0 ? (
        <Controller
          control={control}
          name={`lines.${index}.description`}
          render={({ field, fieldState }) => (
            <SelectField
              label="Service"
              placeholder="Choose from your services"
              options={services.map((service) => ({
                value: service.name,
                label: service.name,
                description: `${formatPrice(service.priceInPaise)} excl. GST`,
              }))}
              value={field.value || null}
              error={fieldState.error?.message}
              onChange={(name) => {
                field.onChange(name);
                const service = services.find((candidate) => candidate.name === name);
                if (service)
                  setValue(`lines.${index}.price`, String(service.priceInPaise / 100), {
                    shouldValidate: true,
                  });
              }}
            />
          )}
        />
      ) : (
        <Controller
          control={control}
          name={`lines.${index}.description`}
          render={({ field, fieldState }) => (
            <Input
              label={line?.kind === "part" ? "Part" : "Description"}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              placeholder={line?.kind === "part" ? "Front brake pads" : "Chain clean and adjust"}
            />
          )}
        />
      )}
      {line?.kind === "part" && (
        <>
          {canSearchParts && (
            <Button variant="outline" icon={Search} label="Find a SpareX part" onPress={pickPart} />
          )}
          <Controller
            control={control}
            name={`lines.${index}.partNumber`}
            render={({ field }) => (
              <Input
                label="Part number (optional)"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="characters"
              />
            )}
          />
        </>
      )}
      <View className="flex-row items-end gap-3">
        <Controller
          control={control}
          name={`lines.${index}.quantity`}
          render={({ field }) => (
            <View className="gap-1.5">
              <Text variant="label">Quantity</Text>
              <QuantityStepper
                value={Number(field.value) || 1}
                onChange={(value) => field.onChange(String(value))}
              />
            </View>
          )}
        />
        <View className="flex-1">
          <Controller
            control={control}
            name={`lines.${index}.price`}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Price each, excl. GST"
                prefix="₹"
                decimals
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name={`lines.${index}.gst`}
        render={({ field }) => (
          <View className="gap-1.5">
            <Text variant="label">GST</Text>
            <View className="-mx-4">
              <FilterChips
                label="GST rate"
                options={GST_RATES.map((rate) => ({ value: rate, label: `${rate}%` }))}
                value={field.value}
                onChange={field.onChange}
              />
            </View>
          </View>
        )}
      />
      <View className="flex-row justify-between border-t border-gray-200 pt-2">
        <Text variant="small" tone="muted">
          Line total, excl. GST
        </Text>
        <Text weight="semibold" tabular>
          {formatPrice(lineTotal)}
        </Text>
      </View>
    </Card>
  );
}
