import React, { useRef, useState, useEffect, type ReactNode } from 'react';
import { View, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent, type ViewStyle } from 'react-native';

/**
 * A horizontal, paged swiper for a small fixed set of full-width pages. `index`
 * is controlled: tap a tab to set it (glides across) or swipe left/right to
 * change it (settles on the nearest page and reports back via onIndexChange).
 *
 * Reuses the calendar carousel's idle-debounce settle so it behaves with drag,
 * fling and trackpad wheel on web (where onMomentumScrollEnd is unreliable).
 * Pages are measured from the container width and gated until measured, to
 * avoid the default-width race that would jump to the wrong page on mount.
 */
export function SwipePager({ index, onIndexChange, children, style }: {
  index: number;
  onIndexChange: (i: number) => void;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const pages = React.Children.toArray(children);
  const count = pages.length;
  const scRef = useRef<ScrollView>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const pageW = size.w;
  const shown = useRef(index);
  const didInit = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));

  const onLayout = (e: NativeSyntheticEvent<{ layout: { width: number; height: number } }>) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0 && (w !== size.w || h !== size.h)) setSize({ w, h });
  };

  // First layout: jump (no animation) to the controlled page.
  useEffect(() => {
    if (pageW <= 0 || didInit.current) return;
    didInit.current = true;
    shown.current = clamp(index);
    requestAnimationFrame(() => scRef.current?.scrollTo({ x: shown.current * pageW, animated: false }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageW]);

  // Tab tap (index changed from outside): glide to the requested page.
  useEffect(() => {
    if (!didInit.current || pageW <= 0) return;
    if (clamp(index) === shown.current) return;
    shown.current = clamp(index);
    scRef.current?.scrollTo({ x: shown.current * pageW, animated: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Swipe settle: once scrolling has been idle briefly, adopt the nearest page.
  const settleAt = (x: number) => {
    if (!pageW) return;
    const i = clamp(Math.round(x / pageW));
    if (i !== shown.current) { shown.current = i; onIndexChange(i); }
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!didInit.current) return;
    const x = e.nativeEvent.contentOffset.x;
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => settleAt(x), 130);
  };

  useEffect(() => () => { if (idle.current) clearTimeout(idle.current); }, []);

  return (
    <View style={[{ flex: 1 }, style]} onLayout={onLayout}>
      {pageW > 0 && (
        <ScrollView
          ref={scRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          style={{ flex: 1 }}
        >
          {/* Each page is pinned to the pager's measured size. The fixed height is
              essential: a vertical ScrollView only scrolls when its height is
              bounded, and nested inside this horizontal scroller it otherwise
              stretches to its full content height and never clips. */}
          {pages.map((child, i) => (
            <View key={i} style={{ width: size.w, height: size.h }}>{child}</View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
