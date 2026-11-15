// Copied from spareXB2B/src/features/notifications/types.ts, with `needsAction` the API also sends.

export type NotificationTone = "info" | "success" | "warning" | "danger";

export type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  /** A website path, e.g. "/garage/bookings/bkg_…"; the app maps it to its own screen. */
  href: string;
  tone: NotificationTone;
  isRead: boolean;
  needsAction?: boolean;
};
