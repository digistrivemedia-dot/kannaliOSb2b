import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useProductFilters, type ProductFilters } from "@/features/catalog/filter-store";
import { useCatalogFilters } from "@/features/catalog/queries";
import type { VehicleType } from "@/features/jobs/types";

const TYPE_LABELS: Record<VehicleType, string> = {
  bike: "Bike",
  scooter: "Scooter",
  car: "Car",
  commercial: "Commercial",
};
const ANY = "any";

/** The product list's Filters sheet: category, brand, vehicle fit (type → make → model), in stock. */
export function ProductFiltersScreen() {
  const saved = useProductFilters();
  const options = useCatalogFilters();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<ProductFilters>({ ...saved });
  const models = options.data?.vehicleModels ?? [];
  const types = [...new Set(models.map((model) => model.type))];
  const makes = [
    ...new Set(
      models.filter((model) => model.type === draft.vehicleType).map((model) => model.brand),
    ),
  ];
  const fits = models.filter(
    (model) => model.type === draft.vehicleType && model.brand === draft.vehicleBrand,
  );
  const pick = (value: string) => (value === ANY ? undefined : value);

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-4 pt-6">
        <Text variant="heading" accessibilityRole="header">
          Filters
        </Text>
        <SelectField
          label="Category"
          options={[
            { value: ANY, label: "Every category" },
            ...(options.data?.categories ?? []).map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
          value={draft.categoryId ?? ANY}
          onChange={(value) => setDraft({ ...draft, categoryId: pick(value) })}
        />
        <SelectField
          label="Brand"
          options={[
            { value: ANY, label: "Every brand" },
            ...(options.data?.brands ?? []).map((brand) => ({ value: brand, label: brand })),
          ]}
          value={draft.brand ?? ANY}
          onChange={(value) => setDraft({ ...draft, brand: pick(value) })}
        />
        <Text variant="label" tone="muted" sectionLabel>
          Fits the vehicle
        </Text>
        <SelectField
          label="Vehicle type"
          options={[
            { value: ANY, label: "Any vehicle" },
            ...types.map((type) => ({ value: type, label: TYPE_LABELS[type] })),
          ]}
          value={draft.vehicleType ?? ANY}
          onChange={(value) =>
            setDraft({
              ...draft,
              vehicleType: pick(value) as VehicleType | undefined,
              vehicleBrand: undefined,
              vehicleId: undefined,
            })
          }
        />
        {draft.vehicleType && (
          <SelectField
            label="Make"
            options={[
              { value: ANY, label: "Any make" },
              ...makes.map((make) => ({ value: make, label: make })),
            ]}
            value={draft.vehicleBrand ?? ANY}
            onChange={(value) =>
              setDraft({ ...draft, vehicleBrand: pick(value), vehicleId: undefined })
            }
          />
        )}
        {draft.vehicleBrand && (
          <SelectField
            label="Model"
            options={[
              { value: ANY, label: "Any model" },
              ...fits.map((model) => ({ value: model.id, label: model.model })),
            ]}
            value={draft.vehicleId ?? ANY}
            onChange={(value) => setDraft({ ...draft, vehicleId: pick(value) })}
          />
        )}
        <Switch
          label="In stock at my branch"
          value={draft.inStockOnly}
          onChange={(inStockOnly) => setDraft({ ...draft, inStockOnly })}
        />
      </ScrollView>
      <View className="gap-2 px-4">
        <Button
          size="main"
          label="Show parts"
          onPress={() => {
            saved.set(draft);
            router.back();
          }}
        />
        <Button
          variant="ghost"
          label="Clear filters"
          fullWidth
          onPress={() => setDraft({ inStockOnly: false })}
        />
      </View>
    </View>
  );
}
