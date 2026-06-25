import React from 'react';
import { AppScreen } from '../../src/components/AppScreen';
import A10Timeline from '../../src/screens/app/A10Timeline';

/** Timeline tab. */
export default function TimelineTab() {
  return (
    <AppScreen>
      <A10Timeline embedded />
    </AppScreen>
  );
}
