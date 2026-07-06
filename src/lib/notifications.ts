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
    await Notifications.setNotificationChannelAsync('everly-reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await notifPermissionGranted())) return;

  if (prefs.notifReminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Everly', body: 'A gentle nudge to log today’s moments.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: REMINDER_HOUR, minute: 0 },
    });
  }
  if (prefs.notifDigest) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Your week with Everly', body: 'Your Sunday summary is ready.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: DIGEST_WEEKDAY, hour: DIGEST_HOUR, minute: 0 },
    });
  }
}
