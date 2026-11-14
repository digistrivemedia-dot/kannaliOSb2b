import { CircleAlert, CircleCheck } from "lucide-react-native";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

import { Text } from "@/components/ui/Text";
import { haptic } from "@/lib/haptics";
import { colors } from "@/lib/theme";

type Toast = { id: number; message: string; tone: "success" | "danger" };

const useToast = create<{ toast: Toast | null }>(() => ({ toast: null }));

const VISIBLE_MS = 3000;
let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** A short message after an action, with a light haptic: "Technician assigned". */
export function showToast({ message, tone = "success" }: { message: string; tone?: Toast["tone"] }) {
  if (tone === "success") haptic.confirm();
  const toast = { id: nextId++, message, tone };
  useToast.setState({ toast });
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => useToast.setState({ toast: null }), VISIBLE_MS);
}

/** Renders the current toast at the top of the screen. Mounted once, in the root layout. */
export function ToastHost() {
  const toast = useToast((state) => state.toast);
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  const Icon = toast.tone === "success" ? CircleCheck : CircleAlert;
  return (
    <View pointerEvents="none" className="absolute inset-x-0 px-4" style={{ top: insets.top + 8 }}>
      <Animated.View
        key={toast.id}
        entering={FadeInUp}
        exiting={FadeOutUp}
        accessibilityLiveRegion="assertive"
        accessibilityRole="alert"
      >
        <View className="flex-row items-center gap-3 rounded-button bg-navy-900 px-4 py-3.5">
          <Icon size={22} color={toast.tone === "success" ? colors.white : colors.orange[500]} />
          <Text tone="inverse" weight="medium" className="flex-1">
            {toast.message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
