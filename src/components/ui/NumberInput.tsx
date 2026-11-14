import { Input, type InputProps } from "@/components/ui/Input";

type NumberInputProps = Omit<InputProps, "keyboardType" | "onChangeText" | "value"> & {
  value: string;
  onChangeText: (value: string) => void;
  /** Allows one decimal point with up to two places, for rupee amounts. */
  decimals?: boolean;
};

/** Odometer, quantities and amounts: the number keypad, and only digits get in. */
export function NumberInput({ value, onChangeText, decimals = false, ...props }: NumberInputProps) {
  return (
    <Input
      {...props}
      value={value}
      keyboardType={decimals ? "decimal-pad" : "number-pad"}
      inputMode={decimals ? "decimal" : "numeric"}
      emphasis
      onChangeText={(text) => onChangeText(decimals ? keepAmount(text) : text.replace(/\D/g, ""))}
    />
  );
}

/** "1,250.505" → "1250.50": digits, one point, two places. */
function keepAmount(text: string): string {
  const [whole = "", ...rest] = text.replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}
