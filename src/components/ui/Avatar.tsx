import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

type AvatarProps = {
  name: string;
  size?: "small" | "regular";
};

/** A person's initials in a navy circle. Read out as their name. */
export function Avatar({ name, size = "regular" }: AvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={name}
      className={cn(
        "items-center justify-center rounded-full bg-navy-100",
        size === "small" ? "h-8 w-8" : "h-10 w-10",
      )}
    >
      <Text variant={size === "small" ? "label" : "small"} weight="semibold" tone="navy">
        {initials(name)}
      </Text>
    </View>
  );
}
