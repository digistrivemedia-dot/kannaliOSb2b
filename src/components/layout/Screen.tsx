import { createContext, useContext, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { colors } from "@/lib/theme";

/** Whether the screen sits above the tab bar, which already keeps clear of the home indicator. */
const ScreenContext = createContext({ inTabs: false });

export function useScreenContext() {
  return useContext(ScreenContext);
}

type ScreenProps = {
  /** A TopBar on the main tabs, a Header everywhere else. */
  header: ReactNode;
  children: ReactNode;
  /** The main action, in a BottomBar (or a NextStepBar on a job card). */
  bottomBar?: ReactNode;
  /** Pull to refresh; the spinner shows until the promise settles. */
  onRefresh?: () => Promise<unknown>;
  /** False for screens that bring their own list (FlashList), which scrolls by itself. */
  scroll?: boolean;
  inTabs?: boolean;
};

/**
 * Every screen: header, the offline banner, content that scrolls (with pull to refresh) and a bottom
 * bar that stays above the keyboard and the home indicator.
 */
export function Screen({
  header,
  children,
  bottomBar,
  onRefresh,
  scroll = true,
  inTabs = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Without a bottom bar or tab bar below it, the content keeps clear of the home indicator itself.
  const bottomSpace = bottomBar || inTabs ? 24 : insets.bottom + 24;

  return (
    <ScreenContext.Provider value={{ inTabs }}>
      <KeyboardAvoidingView behavior="padding" className="flex-1 bg-gray-50">
        {header}
        <OfflineBanner />
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-6 p-4"
            contentContainerStyle={{ paddingBottom: bottomSpace }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refresh}
                  tintColor={colors.navy[700]}
                  colors={[colors.navy[700]]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1">{children}</View>
        )}
        {bottomBar}
      </KeyboardAvoidingView>
    </ScreenContext.Provider>
  );
}
