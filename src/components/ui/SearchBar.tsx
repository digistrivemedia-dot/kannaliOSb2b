import { Search, X } from "lucide-react-native";
import { TextInput, View } from "react-native";

import { IconButton } from "@/components/ui/IconButton";
import { colors, fonts } from "@/lib/theme";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  /** Says what can be searched: "Plate, job number or customer". */
  placeholder: string;
};

/** The search at the top of every list. */
export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View className="min-h-12 flex-row items-center gap-2 rounded-input border border-gray-300 bg-white pl-3">
      <Search size={20} color={colors.gray[600]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[500]}
        accessibilityLabel={placeholder}
        accessibilityRole="search"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 py-2.5 text-gray-900"
        style={{ fontFamily: fonts.regular, fontSize: 16 }}
      />
      {value ? <IconButton icon={X} label="Clear search" onPress={() => onChangeText("")} /> : null}
    </View>
  );
}
