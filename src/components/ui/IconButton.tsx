import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

const TONES = {
  default: { box: "active:bg-gray-100", color: colors.gray[900] },
  /** On the navy top bar. */
  inverse: { box: "active:bg-navy-800", color: colors.white },
  navy: { box: "bg-navy-50 active:bg-navy-100", color: colors.navy[700] },
} as const;

type IconButtonProps = {
  icon: LucideIcon;
  /** Read out by TalkBack and VoiceOver: every icon button needs one. */
  label: string;
  onPress: () => void;
  tone?: keyof typeof TONES;
  /** A count on the icon, such as unread notifications or cart items. */
  badge?: number;
  disabled?: boolean;
  className?: string;
};

/** A 48 × 48 tap target holding one icon. */
export function IconButton({
  icon: Icon,
  label,
  onPress,
  tone = "default",
  badge,
  disabled,
  className,
}: IconButtonProps) {
  const style = TONES[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge}` : label}
      accessibilityState={{ disabled }}
      className={cn("h-12 w-12 items-center justify-center rounded-full", style.box, className)}
    >
      <Icon size={24} color={style.color} />
      {badge ? (
        <View className="absolute right-1 top-1 h-5 min-w-5 items-center justify-center rounded-full bg-orange-700 px-1">
          <Text variant="label" tone="inverse" weight="semibold" tabular>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
