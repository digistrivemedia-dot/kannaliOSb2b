import { Check, Circle } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { PASSWORD_RULES } from "@/features/auth/schemas";
import { colors } from "@/lib/theme";

/** The password rules as ticks that fill in while typing. */
export function PasswordRules({ password }: { password: string }) {
  return (
    <View className="gap-1.5">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.test(password);
        const Icon = isMet ? Check : Circle;
        return (
          <View
            key={rule.label}
            accessible
            accessibilityLabel={`${rule.label}, ${isMet ? "done" : "not yet"}`}
            className="flex-row items-center gap-2"
          >
            <Icon size={18} strokeWidth={isMet ? 3 : 2} color={isMet ? colors.success[700] : colors.gray[500]} />
            <Text variant="small" tone={isMet ? "success" : "muted"} weight={isMet ? "medium" : "regular"}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
