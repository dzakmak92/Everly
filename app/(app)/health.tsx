import React from 'react';
import { AppScreen } from '../../src/components/AppScreen';
import A05HealthHub from '../../src/screens/app/A05HealthHub';

/** Health tab. */
export default function HealthTab() {
  return (
    <AppScreen>
      <A05HealthHub embedded />
    </AppScreen>
  );
}
