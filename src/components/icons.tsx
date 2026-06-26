import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon, Ellipse } from 'react-native-svg';

/**
 * Flat line-icon set — 2px stroke, rounded caps, single contextual color.
 * Mirrors the inline SVGs used throughout the Pregnancy design file.
 * Default stroke style; pass `fill` variants where the design fills the shape.
 */
export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const stroke = (color: string, w = 2) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ChevronLeft = ({ size = 24, color = '#D46E97', strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" {...stroke(color, strokeWidth)} />
  </Svg>
);

export const ChevronRight = ({ size = 24, color = '#9C9AB2', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 18l6-6-6-6" {...stroke(color, strokeWidth)} />
  </Svg>
);

export const Home = ({ size = 18, color = '#D46E97' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...stroke(color)} />
    <Path d="M9 22V12h6v10" {...stroke(color)} />
  </Svg>
);

export const Grid = ({ size = 18, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" {...stroke(color)} />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" {...stroke(color)} />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" {...stroke(color)} />
    <Rect x="14" y="14" width="7" height="7" rx="1.5" {...stroke(color)} />
  </Svg>
);

export const Calendar = ({ size = 18, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="3" {...stroke(color)} />
    <Path d="M16 2v4M8 2v4M3 10h18" {...stroke(color)} />
  </Svg>
);

export const User = ({ size = 18, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="9" cy="7" r="4" {...stroke(color)} />
    <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" {...stroke(color)} />
  </Svg>
);

export const Settings = ({ size = 18, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="3" {...stroke(color)} />
    <Path
      d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      {...stroke(color)}
    />
  </Svg>
);

export const Plus = ({ size = 22, color = '#FFFFFF', strokeWidth = 2.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 5v14M5 12h14" {...stroke(color, strokeWidth)} />
  </Svg>
);

export const Clock = ({ size = 22, color = '#C9A33B' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" {...stroke(color)} />
    <Path d="M12 6v6l4 2" {...stroke(color)} />
  </Svg>
);

export const Phone = ({ size = 16, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1.07 3.39 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"
      {...stroke(color)}
    />
  </Svg>
);

export const Check = ({ size = 11, color = '#3FA98A', strokeWidth = 2.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 13l4 4L19 7" {...stroke(color, strokeWidth)} />
  </Svg>
);

export const Heart = ({ size = 24, color = '#E98FB3', filled = true }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      {...(filled ? { fill: color } : stroke(color))}
    />
  </Svg>
);

export const Shield = ({ size = 15, color = '#6B6FC9' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...stroke(color)} />
    <Path d="M9 12l2 2 4-4" {...stroke(color)} />
  </Svg>
);

export const Info = ({ size = 16, color = '#D46E97' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" {...stroke(color)} />
    <Line x1="12" y1="8" x2="12" y2="12" {...stroke(color)} />
    <Line x1="12" y1="16" x2="12.01" y2="16" {...stroke(color)} />
  </Svg>
);

export const Search = ({ size = 16, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="11" cy="11" r="8" {...stroke(color)} />
    <Path d="m21 21-4.35-4.35" {...stroke(color)} />
  </Svg>
);

export const Camera = ({ size = 18, color = '#D46E97' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="8" width="18" height="12" rx="2" {...stroke(color)} />
    <Path d="M8 8V5a2 2 0 0 1 4 0v3" {...stroke(color)} />
  </Svg>
);

export const Leaf = ({ size = 16, color = '#3A9B8A' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 22V8" {...stroke(color)} />
    <Path d="M12 12c0-3-2.5-5-5.5-5 0 3 2.5 5 5.5 5z" {...stroke(color)} />
    <Path d="M12 10c0-3 2.5-5 5.5-5 0 3-2.5 5-5.5 5z" {...stroke(color)} />
  </Svg>
);

export const Star = ({ size = 16, color = '#E9C46A' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
  </Svg>
);

export const Activity = ({ size = 16, color = '#6B6FC9' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" {...stroke(color)} />
  </Svg>
);

export const MessageSquare = ({ size = 15, color = '#6B6FC9' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...stroke(color)} />
  </Svg>
);

export const Archive = ({ size = 22, color = '#3FA98A' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polyline points="21 8 21 21 3 21 3 8" {...stroke(color)} />
    <Rect x="1" y="3" width="22" height="5" {...stroke(color)} />
    <Line x1="10" y1="12" x2="14" y2="12" {...stroke(color)} />
  </Svg>
);

export const Play = ({ size = 14, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polygon points="5 3 19 12 5 21 5 3" fill={color} />
  </Svg>
);

export const Pause = ({ size = 22, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6" y="4" width="4" height="16" fill={color} />
    <Rect x="14" y="4" width="4" height="16" fill={color} />
  </Svg>
);

export const Download = ({ size = 16, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...stroke(color)} />
    <Polyline points="7 10 12 15 17 10" {...stroke(color)} />
    <Line x1="12" y1="15" x2="12" y2="3" {...stroke(color)} />
  </Svg>
);

export const Film = ({ size = 14, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polygon points="23 7 16 12 23 17 23 7" {...stroke(color)} />
    <Rect x="1" y="5" width="15" height="14" rx="2" {...stroke(color)} />
  </Svg>
);

export const Video = ({ size = 14, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polygon points="23 7 16 12 23 17 23 7" {...stroke(color)} />
    <Rect x="1" y="5" width="15" height="14" rx="2" {...stroke(color)} />
  </Svg>
);

export const CheckCircle = ({ size = 18, color = '#C9A33B' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" {...stroke(color)} />
    <Polyline points="22 4 12 14.01 9 11.01" {...stroke(color)} />
  </Svg>
);

export const X = ({ size = 24, color = '#9C9AB2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line x1="18" y1="6" x2="6" y2="18" {...stroke(color)} />
    <Line x1="6" y1="6" x2="18" y2="18" {...stroke(color)} />
  </Svg>
);

export const ArrowRight = ({ size = 24, color = '#FFFFFF', strokeWidth = 2.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12h14M12 5l7 7-7 7" {...stroke(color, strokeWidth)} />
  </Svg>
);

export const Smile = ({ size = 18, color = '#6B6FC9', mood = 'good' }: IconProps & { mood?: 'rough' | 'okay' | 'good' | 'great' | 'amazing' }) => {
  const mouth: Record<string, string> = {
    rough: 'M16 16s-1.5-2-4-2-4 2-4 2',
    okay: 'M10 14s.8 1 2 1 2-1 2-1',
    good: 'M8 13s1.5 2 4 2 4-2 4-2',
    great: 'M8 13s1.5 2.5 4 2.5 4-2.5 4-2.5',
    amazing: 'M8 13s2 3 4 3 4-3 4-3',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" {...stroke(color)} />
      <Path d={mouth[mood]} {...stroke(color)} />
      <Line x1="9" y1="9" x2="9.01" y2="9" {...stroke(color)} />
      <Line x1="15" y1="9" x2="15.01" y2="9" {...stroke(color)} />
    </Svg>
  );
};

/** Baby / fetus glyph used on size cards. */
export const BabyBean = ({ size = 36, color = '#D46E97' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Ellipse cx="12" cy="12" rx="5" ry="9" {...stroke(color, 1.5)} />
    <Path d="M12 3Q9 6 8 9M12 3Q15 6 16 9" {...stroke(color, 1.5)} />
  </Svg>
);

/** Lock body used inside the premium sprout-lock badge. */
export const LockGlyph = ({ size = 11 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 9.5c0-2-1.6-3.6-3.7-3.6C8.1 8 9.7 9.5 12 9.5z" fill="rgba(255,255,255,.55)" />
    <Rect x="7.5" y="10.5" width="9" height="7.5" rx="2" fill="#fff" />
    <Path d="M9.7 10.5V9a2.3 2.3 0 0 1 4.6 0v1.5" stroke="#fff" strokeWidth={1.5} fill="none" />
  </Svg>
);
