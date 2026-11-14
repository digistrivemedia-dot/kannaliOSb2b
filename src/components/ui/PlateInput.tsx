import { Input, type InputProps } from "@/components/ui/Input";
import { formatPlate } from "@/lib/format";

type PlateInputProps = Omit<InputProps, "onChangeText" | "value"> & {
  value: string;
  onChangeText: (plate: string) => void;
};

/** A number plate, formatted as it is typed: "ka01ab1234" shows as "KA 01 AB 1234". */
export function PlateInput({ value, onChangeText, ...props }: PlateInputProps) {
  return (
    <Input
      placeholder="KA 01 AB 1234"
      autoCapitalize="characters"
      autoCorrect={false}
      autoComplete="off"
      keyboardType="visible-password"
      {...props}
      emphasis
      value={value}
      onChangeText={(text) => onChangeText(formatPlate(text))}
    />
  );
}
