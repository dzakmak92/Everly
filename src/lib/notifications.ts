import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Prefs } from './settings';

/**
 * Local scheduled reminders. These are device-side notifications (no server) —
 * they fire on iOS/Android in a real build. On web they're a no-op, since the
 * platform can't schedule background local notifications reliably.
 */
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

const REMINDER_HOUR = 9;   // 9:00 — a gentle morning nudge
const DIGEST_WEEKDAY = 1;  // Sunday (1 = Sunday in expo-notifications)
const DIGEST_HOUR = 18;    // 18:00

/** Ask the OS for permission to post notifications. Returns whether it's granted. */
export async function requestNotifPermission(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.status === 'granted';
}

/** Whether notifications are already permitted (no prompt). */
export async function notifPermissionGranted(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted || current.status === 'granted';
}

/**
 * Reconcile the OS's scheduled reminders with the user's preferences. Cancels
 * everything Everly scheduled, then re-schedules only the enabled reminders.
 * Safe to call on every toggle and on app start.
 */
export async function syncNotifications(prefs: Pick<Prefs, 'notifReminders' | 'notifDigest'>): Promise<void> {
  if (!supported) return;
  if (Platform.OS === 'android') {
    // HIGH importance → the reminder pops as a heads-up banner with a sound.
    await Notifications.setNotificationChannelAsync('everly-reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await notifPermissionGranted())) return;

  if (prefs.notifReminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'A quiet moment', body: 'A gentle moment to remember today. 🤍', sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: REMINDER_HOUR, minute: 0, channelId: 'everly-reminders' },
    });
  }
  if (prefs.notifDigest) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Your week, gathered', body: 'Your Sunday look-back is ready.', sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: DIGEST_WEEKDAY, hour: DIGEST_HOUR, minute: 0, channelId: 'everly-reminders' },
    });
  }
}
