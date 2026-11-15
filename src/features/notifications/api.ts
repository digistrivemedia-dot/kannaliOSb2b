import type { Notification } from "@/features/notifications/types";
import { apiClient } from "@/lib/api-client";

/** The signed-in user's notifications, newest first. */
export function getNotifications(): Promise<Notification[]> {
  return apiClient.get<Notification[]>("/notifications");
}

export function markNotificationRead(id: string): Promise<void> {
  return apiClient.post<void>(`/notifications/${encodeURIComponent(id)}/read`);
}

export function markAllNotificationsRead(): Promise<void> {
  return apiClient.post<void>("/notifications/read-all");
}
