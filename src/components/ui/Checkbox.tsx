import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { colors } from "@/lib/theme";

type CheckboxProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({ label, description, checked, onChange, disabled }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onChange(!checked);
      }}
      className={cn("min-h-12 flex-row items-center gap-3 py-2", disabled && "opacity-50")}
    >
      <View
        className={cn(
          "h-7 w-7 items-center justify-center rounded-plate border-2",
          checked ? "border-navy-800 bg-navy-800" : "border-gray-500 bg-white",
        )}
      >
        {checked && <Check size={18} strokeWidth={3} color={colors.white} />}
      </View>
      <View className="flex-1">
        <Text>{label}</Text>
        {description ? (
          <Text variant="small" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
