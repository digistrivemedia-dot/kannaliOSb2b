import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Shown on the right, before the chevron: a count, an amount or a badge. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Draws a hairline above the row, for rows stacked inside a flush card. */
  divided?: boolean;
  destructive?: boolean;
};

export function ListRow({
  title,
  subtitle,
  icon: Icon,
  trailing,
  onPress,
  divided,
  destructive,
}: ListRowProps) {
  const content = (
    <>
      {Icon && (
        <View
          className={cn(
            "h-10 w-10 items-center justify-center rounded-button",
            destructive ? "bg-danger-50" : "bg-navy-50",
          )}
        >
          <Icon size={22} color={destructive ? colors.danger[700] : colors.navy[700]} />
        </View>
      )}
      <View className="flex-1">
        <Text weight="medium" tone={destructive ? "danger" : "default"}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {typeof trailing === "string" ? <Text tone="muted">{trailing}</Text> : trailing}
      {onPress && <ChevronRight size={22} color={colors.gray[500]} />}
    </>
  );
  const style = cn(
    "min-h-14 flex-row items-center gap-3 px-4 py-3",
    divided && "border-t border-gray-200",
  );
  if (!onPress) return <View className={style}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      className={cn(style, "active:bg-gray-50")}
    >
      {content}
    </Pressable>
  );
}
