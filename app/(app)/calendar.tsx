import React from 'react';
import { AppScreen } from '../../src/components/AppScreen';
import A04Calendar from '../../src/screens/app/A04Calendar';

/** Calendar tab. */
export default function CalendarTab() {
  return (
    <AppScreen>
      <A04Calendar embedded />
    </AppScreen>
  );
}
