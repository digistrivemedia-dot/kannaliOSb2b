import * as Haptics from "expo-haptics";

/** Haptics never fail an action: a phone without them just stays still. */
export const haptic = {
  /** A light tap when something is done: saved, sent, assigned. */
  confirm: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  /** A selection change: a chip, a step, an OK / Replace choice. */
  select: () => void Haptics.selectionAsync().catch(() => undefined),
  /** Something needs attention now, such as a new booking. */
  alert: () =>
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
};
