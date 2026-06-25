import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../theme/tokens';

/**
 * Scroll container for a tab body. Renders an embedded design screen full-width
 * with safe-area top padding (the mock status bar is suppressed via `embedded`).
 */
export function AppScreen({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: dark ? color.nightBg : color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
