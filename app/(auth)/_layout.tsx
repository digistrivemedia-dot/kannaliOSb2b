import { Stack } from "expo-router";

import { colors } from "@/lib/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarStyle: "light",
        contentStyle: { backgroundColor: colors.gray[50] },
      }}
    />
  );
}
