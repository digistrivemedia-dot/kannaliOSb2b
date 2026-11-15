import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { Pressable, RefreshControl, View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/features/notifications/queries";
import type { Notification } from "@/features/notifications/types";
import { notificationTarget } from "@/features/notifications/utils";
import { cn } from "@/lib/cn";
import { formatAge } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { colors, toneColors } from "@/lib/theme";

/** G86: the user's notifications, newest first, unread marked; a tap opens the right screen. */
export function NotificationsScreen() {
  const notifications = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const list = notifications.data ?? [];
  const unread = list.filter((notification) => !notification.isRead).length;

  const open = (notification: Notification) => {
    if (!notification.isRead) markRead.mutate(notification.id);
    const target = notificationTarget(notification.href);
    if (target) router.push(target);
  };

  return (
    <Screen
      scroll={false}
      header={
        <Header
          title="Notifications"
          subtitle={unread ? `${unread} unread` : undefined}
          actions={
            unread ? (
              <Button
                variant="ghost"
                label="Mark all read"
                onPress={() => {
                  haptic.confirm();
                  markAll.mutate();
                }}
              />
            ) : undefined
          }
        />
      }
    >
      {notifications.isPending ? (
        <View accessible accessibilityLabel="Loading" className="gap-3 p-4">
          <Skeleton shape="card" className="h-20 w-full" />
          <Skeleton shape="card" className="h-20 w-full" />
        </View>
      ) : notifications.isError && list.length === 0 ? (
        <ErrorState
          error={notifications.error}
          onRetry={() => void notifications.refetch()}
          what="your notifications"
        />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(notification) => notification.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => open(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={notifications.isRefetching}
              onRefresh={() => void notifications.refetch()}
              tintColor={colors.navy[700]}
              colors={[colors.navy[700]]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Bell}
              title="Nothing new"
              message="New bookings, order updates and other news show here."
            />
          }
        />
      )}
    </Screen>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.isRead ? "" : "Unread. "}${notification.title}. ${notification.description}`}
      className={cn(
        "min-h-16 flex-row gap-3 border-b border-gray-200 px-4 py-3 active:bg-gray-100",
        notification.isRead ? "bg-white" : "bg-navy-50",
      )}
    >
      <View
        className="mt-2 h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: notification.isRead
            ? "transparent"
            : toneColors[notification.tone].strong,
        }}
      />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-start justify-between gap-3">
          <Text weight={notification.isRead ? "medium" : "semibold"} className="flex-1">
            {notification.title}
          </Text>
          <Text variant="small" tone="muted">
            {formatAge(notification.createdAt)}
          </Text>
        </View>
        <Text variant="small" tone="muted">
          {notification.description}
        </Text>
      </View>
    </Pressable>
  );
}
