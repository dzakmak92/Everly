import { Redirect } from 'expo-router';

/** Maternal appointments merged into the unified Appointments screen. */
export default function MatAppointments() {
  return <Redirect href="/(app)/preg-appointments?tab=maternal" />;
}
