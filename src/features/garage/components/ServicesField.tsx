import { Plus, Trash2 } from "lucide-react-native";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Text } from "@/components/ui/Text";
import type { GarageProfileValues } from "@/features/garage/schemas";
import { newServiceId } from "@/features/garage/utils";

/** The services customers can book, each with the garage's own price (excl. GST) and time. */
export function ServicesField({
  control,
  error,
}: {
  control: Control<GarageProfileValues>;
  error?: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
    keyName: "rowKey",
  });
  return (
    <View className="gap-3">
      {fields.map((field, index) => (
        <Card key={field.rowKey} className="gap-3">
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <Controller
                control={control}
                name={`services.${index}.name`}
                render={({ field: input, fieldState }) => (
                  <Input
                    label="Service"
                    value={input.value}
                    onChangeText={input.onChange}
                    onBlur={input.onBlur}
                    error={fieldState.error?.message}
                    autoCapitalize="sentences"
                  />
                )}
              />
            </View>
            <IconButton
              icon={Trash2}
              label={`Remove service ${index + 1}`}
              onPress={() => remove(index)}
              className="mt-6"
            />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name={`services.${index}.price`}
                render={({ field: input, fieldState }) => (
                  <NumberInput
                    decimals
                    label="Price, excl. GST"
                    prefix="₹"
                    value={input.value}
                    onChangeText={input.onChange}
                    onBlur={input.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name={`services.${index}.duration`}
                render={({ field: input, fieldState }) => (
                  <NumberInput
                    label="Takes"
                    suffix="min"
                    value={input.value}
                    onChangeText={input.onChange}
                    onBlur={input.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
          </View>
        </Card>
      ))}
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : null}
      <Button
        variant="outline"
        icon={Plus}
        label="Add a service"
        onPress={() => append({ id: newServiceId(), name: "", price: "", duration: "60" })}
      />
    </View>
  );
}
