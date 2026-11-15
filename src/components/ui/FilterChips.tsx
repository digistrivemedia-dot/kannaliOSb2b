import { ScrollView } from "react-native";

import { Chip } from "@/components/ui/Chip";

type FilterChipOption<T extends string> = { value: T; label: string; count?: number };

type FilterChipsProps<T extends string> = {
  /** Read out before the chips, e.g. "Status". */
  label: string;
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** One choice from a row of chips that scrolls sideways, at the top of a list. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerClassName="gap-2 px-4 py-1"
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          count={option.count}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ScrollView>
  );
}
