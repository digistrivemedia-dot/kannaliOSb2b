import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api";
import type { Notification } from "@/features/notifications/types";

const KEY = ["notifications"] as const;

/** Checked every minute while the app is open, for the bell's count (push replaces this in Phase 10). */
export function useNotifications() {
  return useQuery({ queryKey: KEY, queryFn: getNotifications, refetchInterval: 60_000 });
}

export function useUnreadCount(): number {
  const { data } = useNotifications();
  return data?.filter((notification) => !notification.isRead).length ?? 0;
}

function markLocally(ids: "all" | string) {
  return (list: Notification[] | undefined) =>
    list?.map((notification) =>
      ids === "all" || notification.id === ids ? { ...notification, isRead: true } : notification,
    );
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id) => queryClient.setQueryData<Notification[]>(KEY, markLocally(id)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => queryClient.setQueryData<Notification[]>(KEY, markLocally("all")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
