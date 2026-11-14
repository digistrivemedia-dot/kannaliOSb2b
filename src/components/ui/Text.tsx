import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";

import { cn } from "@/lib/cn";

/** Each style's size and its usual weight. */
const VARIANTS = {
  figure: { size: "text-figure", weight: "semibold" },
  title: { size: "text-title", weight: "semibold" },
  heading: { size: "text-heading", weight: "semibold" },
  body: { size: "text-body", weight: "regular" },
  small: { size: "text-small", weight: "regular" },
  label: { size: "text-label", weight: "medium" },
} as const;

const TONES = {
  default: "text-gray-900",
  /** Secondary text: gray-600, never lighter, because it is read in workshops. */
  muted: "text-gray-600",
  inverse: "text-white",
  inverseMuted: "text-navy-200",
  navy: "text-navy-700",
  action: "text-orange-700",
  success: "text-success-700",
  warning: "text-warning-700",
  danger: "text-danger-700",
  info: "text-info-700",
} as const;

const WEIGHTS = {
  regular: "font-sans",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

export type TextVariant = keyof typeof VARIANTS;
export type TextTone = keyof typeof TONES;

type TextProps = NativeTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Overrides the variant's weight. */
  weight?: keyof typeof WEIGHTS;
  /** Digits of equal width, for amounts and counts that line up. Figures always have them. */
  tabular?: boolean;
  /** Uppercase with tracking: only for section labels. */
  sectionLabel?: boolean;
  className?: string;
};

/** The six text styles (CLAUDE.md §5). Sizes follow the phone's font-size setting. */
export function Text({
  variant = "body",
  tone = "default",
  weight,
  tabular,
  sectionLabel,
  className,
  style,
  ...props
}: TextProps) {
  const isTabular = tabular || variant === "figure";
  return (
    <NativeText
      className={cn(
        VARIANTS[variant].size,
        // One weight class only: two would clash, whatever their order.
        WEIGHTS[weight ?? VARIANTS[variant].weight],
        TONES[tone],
        sectionLabel && "uppercase tracking-wider",
        className,
      )}
      style={[isTabular && { fontVariant: ["tabular-nums"] }, style]}
      // Big figures stop growing a little earlier so tiles keep their shape at the largest sizes.
      maxFontSizeMultiplier={variant === "figure" ? 1.6 : undefined}
      {...props}
    />
  );
}
