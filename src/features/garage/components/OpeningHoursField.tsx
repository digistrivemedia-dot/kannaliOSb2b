import { Controller, useWatch, type Control } from "react-hook-form";
import { View } from "react-native";

import { NumberInput } from "@/components/ui/NumberInput";
import { Switch } from "@/components/ui/Switch";
import type { GarageProfileValues } from "@/features/garage/schemas";
import { maskTime, WEEKDAY_LABELS } from "@/features/garage/utils";

/** One row a day: open or closed, and the hours (24-hour, typed on the number keypad). */
export function OpeningHoursField({ control }: { control: Control<GarageProfileValues> }) {
  const hours = useWatch({ control, name: "openingHours" });
  return (
    <View className="gap-4">
      {hours.map((day, index) => (
        <View key={day.day} className="gap-2">
          <Controller
            control={control}
            name={`openingHours.${index}.isOpen`}
            render={({ field }) => (
              <Switch
                label={WEEKDAY_LABELS[day.day]}
                description={field.value ? undefined : "Closed"}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {day.isOpen ? (
            <View className="flex-row gap-3">
              {(["opensAt", "closesAt"] as const).map((name) => (
                <View key={name} className="flex-1">
                  <Controller
                    control={control}
                    name={`openingHours.${index}.${name}`}
                    render={({ field, fieldState }) => (
                      <NumberInput
                        label={name === "opensAt" ? "Opens" : "Closes"}
                        placeholder="09:00"
                        value={field.value}
                        onChangeText={(text) => field.onChange(maskTime(text))}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
                        accessibilityLabel={`${WEEKDAY_LABELS[day.day]} ${name === "opensAt" ? "opens" : "closes"} at`}
                      />
                    )}
                  />
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
