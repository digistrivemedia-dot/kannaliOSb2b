import { Plus, Trash2 } from "lucide-react-native";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { Text } from "@/components/ui/Text";
import type { CheckInValues } from "@/features/jobs/schemas";

/** Damage already on the vehicle: where, what, and a photo, so nobody is blamed for it later. */
export function DamageNotesField({ control }: { control: Control<CheckInValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "damages" });
  return (
    <View className="gap-3">
      {fields.map((field, index) => (
        <Card key={field.id} className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text weight="semibold">Damage {index + 1}</Text>
            <IconButton
              icon={Trash2}
              label={`Remove damage ${index + 1}`}
              onPress={() => remove(index)}
            />
          </View>
          <Controller
            control={control}
            name={`damages.${index}.area`}
            render={({ field: input, fieldState }) => (
              <Input
                label="Where"
                placeholder="Left side panel"
                value={input.value}
                onChangeText={input.onChange}
                onBlur={input.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name={`damages.${index}.note`}
            render={({ field: input, fieldState }) => (
              <Input
                label="What"
                placeholder="Scratch, about 10 cm"
                value={input.value}
                onChangeText={input.onChange}
                onBlur={input.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name={`damages.${index}.photos`}
            render={({ field: input }) => (
              <PhotoCapture
                label="Damage photos"
                photos={input.value}
                onChange={input.onChange}
                max={3}
              />
            )}
          />
        </Card>
      ))}
      <Button
        variant="outline"
        icon={Plus}
        label={fields.length ? "Add more damage" : "Note damage"}
        onPress={() => append({ id: `d${Date.now()}`, area: "", note: "", photos: [] })}
      />
    </View>
  );
}
