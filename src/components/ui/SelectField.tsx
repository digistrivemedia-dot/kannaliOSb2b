import { router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useSelectSheet, type SelectOption } from "@/components/ui/select-sheet-store";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  /** The sheet's title; the label when left out. */
  sheetTitle?: string;
};

/** Looks like a field; opens a form sheet with the choices. */
export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Choose",
  error,
  sheetTitle,
}: SelectFieldProps) {
  const open = useSelectSheet((state) => state.open);
  const selected = options.find((option) => option.value === value);
  return (
    <View className="gap-1.5">
      <Text variant="label" tone={error ? "danger" : "default"}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityHint="Opens the list of choices"
        onPress={() => {
          open({ title: sheetTitle ?? label, options, value, onSelect: onChange });
          router.push("/sheets/select");
        }}
        className={cn(
          "min-h-14 flex-row items-center gap-2 rounded-input bg-white px-4 active:bg-gray-50",
          error ? "border-2 border-danger-600" : "border border-gray-300",
        )}
      >
        <Text className="flex-1" tone={selected ? "default" : "muted"} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={22} color={colors.gray[600]} />
      </Pressable>
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
