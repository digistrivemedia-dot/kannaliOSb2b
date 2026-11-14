import { Plus, X } from "lucide-react-native";
import {
  useFieldArray,
  type Control,
  type FieldValues,
  type Path,
  type ArrayPath,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

type ComplaintsFieldProps<T extends FieldValues> = {
  control: Control<T>;
  /** The form's complaints array: `{ text }` items. */
  name: ArrayPath<T>;
  error?: string;
};

/** What the customer wants looked at, one line each, in their words. */
export function ComplaintsField<T extends FieldValues>({
  control,
  name,
  error,
}: ComplaintsFieldProps<T>) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <View className="gap-3">
      {fields.map((field, index) => (
        <View key={field.id} className="flex-row items-end gap-1">
          <View className="flex-1">
            <Controller
              control={control}
              name={`${name}.${index}.text` as Path<T>}
              render={({ field: input, fieldState }) => (
                <Input
                  label={index === 0 ? "What the customer said" : `And ${index + 1}`}
                  value={String(input.value ?? "")}
                  onChangeText={input.onChange}
                  onBlur={input.onBlur}
                  error={fieldState.error?.message}
                  placeholder="Brakes squeak when stopping"
                />
              )}
            />
          </View>
          {fields.length > 1 && (
            <IconButton
              icon={X}
              label={`Remove line ${index + 1}`}
              onPress={() => remove(index)}
              className="mb-1"
            />
          )}
        </View>
      ))}
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : null}
      <Button
        variant="ghost"
        icon={Plus}
        label="Add another"
        onPress={() => append({ text: "" } as never)}
      />
    </View>
  );
}
