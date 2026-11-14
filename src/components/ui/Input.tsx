import { useState, type ComponentRef, type ReactNode, type Ref } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors, fonts } from "@/lib/theme";

export type InputProps = Omit<TextInputProps, "style" | "className"> & {
  label: string;
  /** Help under the field, replaced by the error when there is one. */
  hint?: string;
  error?: string;
  /** Shown inside the field before the text, such as "₹". */
  prefix?: ReactNode;
  /** Shown inside the field after the text, such as "km" or a show/hide button. */
  suffix?: ReactNode;
  /** Larger, bolder text, for number plates and amounts. */
  emphasis?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

/** A labelled text field, 56 tall. Every other input in the kit is built on this one. */
export function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  emphasis,
  editable = true,
  onFocus,
  onBlur,
  ref,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const message = error ?? hint;
  return (
    <View className="gap-1.5">
      <Text variant="label" tone={error ? "danger" : "default"}>
        {label}
      </Text>
      <View
        className={cn(
          "min-h-14 flex-row items-center gap-2 rounded-input border bg-white px-4",
          error
            ? "border-2 border-danger-600"
            : isFocused
              ? "border-2 border-navy-600"
              : "border border-gray-300",
          !editable && "bg-gray-100",
        )}
      >
        {typeof prefix === "string" ? <Text tone="muted">{prefix}</Text> : prefix}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={message}
          editable={editable}
          placeholderTextColor={colors.gray[500]}
          selectionColor={colors.navy[600]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          className="flex-1 py-3 text-gray-900"
          style={{
            fontFamily: emphasis ? fonts.bold : fonts.regular,
            fontSize: emphasis ? 22 : 16,
            fontVariant: emphasis ? ["tabular-nums"] : undefined,
          }}
          {...props}
        />
        {typeof suffix === "string" ? <Text tone="muted">{suffix}</Text> : suffix}
      </View>
      {message ? (
        <Text variant="small" tone={error ? "danger" : "muted"}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}
