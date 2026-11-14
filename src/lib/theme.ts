/**
 * Every colour, type style, corner and spacing step in the app. Values come from the Garage OS website
 * (spareXB2B/src/app/globals.css). Brand colours are placeholders until the client's brand guide arrives:
 * change them only here.
 */
export const colors = {
  transparent: "transparent",
  white: "#ffffff",
  black: "#000000",
  navy: {
    50: "#f2f6fb",
    100: "#e6eef8",
    200: "#c5d6ec",
    600: "#24599b",
    700: "#1d4e89",
    800: "#13315c",
    900: "#0b2545",
  },
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
  },
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  success: { 50: "#f0fdf4", 600: "#16a34a", 700: "#15803d" },
  warning: { 50: "#fffbeb", 500: "#f59e0b", 700: "#b45309" },
  danger: { 50: "#fef2f2", 600: "#dc2626", 700: "#b91c1c" },
  info: { 50: "#eff6ff", 700: "#1d4ed8" },
} as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

/** The six text styles (CLAUDE.md §5), one step larger than the customer app. */
export const typeScale = {
  figure: { size: 32, lineHeight: 38 },
  title: { size: 22, lineHeight: 28 },
  heading: { size: 18, lineHeight: 24 },
  body: { size: 16, lineHeight: 24 },
  small: { size: 14, lineHeight: 20 },
  label: { size: 13, lineHeight: 18 },
} as const;

export const radius = {
  none: 0,
  /** The number plate chip: a plate has tighter corners than a card. */
  plate: 6,
  input: 10,
  button: 12,
  card: 14,
  sheet: 20,
  full: 9999,
} as const;

/** Tap targets and bars. */
export const sizes = {
  tap: 48,
  mainButton: 56,
} as const;

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

/** The strong colour and the -50 tint of each status tone. */
export const toneColors: Record<Tone, { strong: string; tint: string }> = {
  neutral: { strong: colors.gray[600], tint: colors.gray[100] },
  info: { strong: colors.info[700], tint: colors.info[50] },
  success: { strong: colors.success[700], tint: colors.success[50] },
  warning: { strong: colors.warning[700], tint: colors.warning[50] },
  danger: { strong: colors.danger[700], tint: colors.danger[50] },
};
