import React from 'react';
import { AppScreen } from '../../src/components/AppScreen';
import A02Today from '../../src/screens/app/A02Today';

/** Today tab — the family dashboard. */
export default function Today() {
  return (
    <AppScreen>
      <A02Today embedded />
    </AppScreen>
  );
}
