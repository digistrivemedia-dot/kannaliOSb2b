import { router } from "expo-router";
import { Bell, ChevronDown, MapPin } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { plannedHref } from "@/components/layout/ComingSoon";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";
import { can } from "@/features/auth/permissions";
import { useSession } from "@/features/auth/store";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { colors } from "@/lib/theme";

type TopBarProps = {
  title: string;
  subtitle?: string;
};

/** The navy bar of the main tabs: the branch (owners tap it to switch), notifications and the title. */
export function TopBar({ title, subtitle }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const session = useSession();
  const branch = useActiveBranch();
  const isGarage = session.business.type === "garage";
  const canSwitch = isGarage && can(session.roles, "garage:all_branches");
  const place = isGarage ? branch.name : session.business.name;

  return (
    <View className="bg-navy-900 px-4 pb-4" style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center justify-between">
        <Pressable
          disabled={!canSwitch}
          onPress={() => router.push("/branch-switcher")}
          accessibilityRole={canSwitch ? "button" : "text"}
          accessibilityLabel={canSwitch ? `Branch: ${place}. Switch branch` : place}
          className="-ml-2 min-h-12 max-w-[75%] flex-row items-center gap-1.5 rounded-button px-2 active:bg-navy-800"
        >
          <MapPin size={18} color={colors.navy[200]} />
          <Text weight="medium" tone="inverse" numberOfLines={1} className="shrink">
            {place}
          </Text>
          {canSwitch && <ChevronDown size={18} color={colors.navy[200]} />}
        </Pressable>
        <IconButton
          icon={Bell}
          label="Notifications"
          tone="inverse"
          onPress={() => router.push(plannedHref("G86"))}
          className="-mr-3"
        />
      </View>
      <Text variant="title" tone="inverse" accessibilityRole="header" numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text tone="inverseMuted" className="mt-0.5">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
