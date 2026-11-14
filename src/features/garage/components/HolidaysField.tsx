import { Plus, Trash2 } from "lucide-react-native";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Text } from "@/components/ui/Text";
import type { GarageProfileValues } from "@/features/garage/schemas";
import { maskTypedDate } from "@/lib/dates";

/** Days the garage is shut: customers can't book them. */
export function HolidaysField({ control }: { control: Control<GarageProfileValues> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "holidays",
    keyName: "rowKey",
  });
  return (
    <View className="gap-3">
      {fields.length === 0 ? <Text tone="muted">No holidays added.</Text> : null}
      {fields.map((field, index) => (
        <View key={field.rowKey} className="flex-row items-start gap-2">
          <View className="w-36">
            <Controller
              control={control}
              name={`holidays.${index}.date`}
              render={({ field: input, fieldState }) => (
                <NumberInput
                  label="Date"
                  placeholder="DD/MM/YYYY"
                  value={input.value}
                  onChangeText={(text) => input.onChange(maskTypedDate(text))}
                  onBlur={input.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name={`holidays.${index}.name`}
              render={({ field: input, fieldState }) => (
                <Input
                  label="Holiday"
                  value={input.value}
                  onChangeText={input.onChange}
                  onBlur={input.onBlur}
                  error={fieldState.error?.message}
                  autoCapitalize="words"
                />
              )}
            />
          </View>
          <IconButton
            icon={Trash2}
            label={`Remove holiday ${index + 1}`}
            onPress={() => remove(index)}
            className="mt-6"
          />
        </View>
      ))}
      <Button
        variant="outline"
        icon={Plus}
        label="Add a holiday"
        onPress={() => append({ date: "", name: "" })}
      />
    </View>
  );
}
