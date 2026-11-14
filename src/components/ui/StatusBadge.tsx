import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { statusTone, type Status } from "@/lib/status";
import { toneColors, type Tone } from "@/lib/theme";

type StatusBadgeProps =
  | { status: Status; word?: undefined; tone?: undefined }
  /** For words that aren't a status, such as "Needs attention" on an inspection item. */
  | { status?: undefined; word: string; tone: Tone };

/** A tone and a word: colour is never the only signal. */
export function StatusBadge(props: StatusBadgeProps) {
  const { tone, word } = props.status ? statusTone(props.status) : props;
  const color = toneColors[tone];
  return (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: color.tint }}
    >
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color.strong }} />
      <Text variant="label" weight="semibold" style={{ color: color.strong }} numberOfLines={1}>
        {word}
      </Text>
    </View>
  );
}
