import type { Config } from "tailwindcss";

import { colors, fonts, radius, typeScale } from "./src/lib/theme";

const px = (value: number) => `${value}px`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    // Replaced, not extended: only the tokens in src/lib/theme.ts exist.
    colors,
    fontFamily: {
      sans: [fonts.regular],
      medium: [fonts.medium],
      semibold: [fonts.semibold],
      bold: [fonts.bold],
    },
    // Weight comes from the font family; a fontWeight on a custom font breaks it on Android.
    fontWeight: {},
    fontSize: Object.fromEntries(
      Object.entries(typeScale).map(([name, { size, lineHeight }]) => [
        name,
        [px(size), { lineHeight: px(lineHeight) }],
      ]),
    ),
    borderRadius: Object.fromEntries(
      Object.entries(radius).map(([name, value]) => [name, px(value)]),
    ),
  },
} satisfies Config;
