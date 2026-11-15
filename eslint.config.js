// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Tailwind loads its config in Node (NativeWind's preset is CommonJS only), and jest.mock
    // factories run before imports, so both use require().
    files: ["tailwind.config.ts", "jest.setup.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    ignores: ["dist/*", ".expo/*", "nativewind-env.d.ts", "expo-env.d.ts"],
  },
]);
