import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { useSelectSheet } from "@/components/ui/select-sheet-store";
import { Text } from "@/components/ui/Text";
import { haptic } from "@/lib/haptics";
import { colors } from "@/lib/theme";

/** The form sheet a SelectField opens: tap a choice and the sheet closes. */
export default function SelectSheet() {
  const { title, options, value, onSelect } = useSelectSheet();
  return (
    <View className="flex-1 bg-white">
      <Text variant="heading" accessibilityRole="header" className="px-4 pb-2 pt-6">
        {title}
      </Text>
      <ScrollView contentContainerClassName="pb-8" accessibilityRole="radiogroup">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
              onPress={() => {
                haptic.select();
                onSelect(option.value);
                router.back();
              }}
              className="min-h-14 flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
            >
              <View className="flex-1">
                <Text weight={isSelected ? "semibold" : "regular"}>{option.label}</Text>
                {option.description ? (
                  <Text variant="small" tone="muted">
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {isSelected && <Check size={22} color={colors.navy[700]} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
