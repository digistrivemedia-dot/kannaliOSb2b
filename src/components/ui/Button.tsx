import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Text, type TextTone } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

const VARIANTS = {
  /** Orange: only for the one main action on a screen. */
  primary: { box: "bg-orange-700 active:bg-orange-800", tone: "inverse", color: colors.white },
  secondary: { box: "bg-navy-800 active:bg-navy-900", tone: "inverse", color: colors.white },
  outline: {
    box: "border-2 border-navy-800 bg-white active:bg-navy-50",
    tone: "navy",
    color: colors.navy[700],
  },
  ghost: { box: "active:bg-navy-50", tone: "navy", color: colors.navy[700] },
  destructive: { box: "bg-danger-700 active:bg-danger-600", tone: "inverse", color: colors.white },
} as const satisfies Record<string, { box: string; tone: TextTone; color: string }>;

const SIZES = {
  /** 56 tall: the main action in a bottom bar. */
  main: { box: "h-14 px-5", text: "heading" },
  regular: { box: "h-12 px-4", text: "body" },
} as const;

type ButtonVariant = keyof typeof VARIANTS;

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  icon?: LucideIcon;
  /** Shows a spinner and ignores taps, while the action runs. */
  loading?: boolean;
  disabled?: boolean;
  /** Stretches across its container; main buttons always do. */
  fullWidth?: boolean;
  accessibilityHint?: string;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "regular",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = size === "main",
  accessibilityHint,
  className,
}: ButtonProps) {
  const style = VARIANTS[variant];
  const isInactive = disabled || loading;
  return (
    <Pressable
      // Called without the press event, so form submit handlers never receive it.
      onPress={() => onPress()}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-button",
        SIZES[size].box,
        style.box,
        fullWidth ? "self-stretch" : "self-start",
        disabled && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={style.color} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon && <Icon size={size === "main" ? 22 : 20} color={style.color} />}
          <Text variant={SIZES[size].text} weight="semibold" tone={style.tone} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
