import { Switch as NativeSwitch, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

type SwitchProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

/** An on/off setting with its label. */
export function Switch({ label, description, value, onChange, disabled }: SwitchProps) {
  return (
    <View className="min-h-12 flex-row items-center gap-3 py-2">
      <View className="flex-1">
        <Text>{label}</Text>
        {description ? (
          <Text variant="small" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <NativeSwitch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.gray[300], true: colors.navy[700] }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.gray[300]}
      />
    </View>
  );
}
