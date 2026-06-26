import { Redirect } from 'expo-router';

/** Night Log was merged into the unified logger (Add) — open it in night mode. */
export default function NightLog() {
  return <Redirect href="/(app)/quick-add?night=1" />;
}
