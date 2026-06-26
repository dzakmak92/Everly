import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

/**
 * Baby-friendly "chunky duotone" motifs for the onboarding slides.
 * One per slide, drawn on a 96×96 grid. Pure pastel fills — no faces.
 */
export type ArtProps = { size?: number };

/** 1 · Welcome — a family growing taller (three ascending figures). */
export function FamilyGrows({ size = 110 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx={24} cy={54} r={5.5} fill="#9FCBB8" />
      <Rect x={17.5} y={59} width={13} height={19} rx={6.5} fill="#9FCBB8" />
      <Circle cx={48} cy={42} r={7} fill="#9CC2DC" />
      <Rect x={40} y={49} width={16} height={29} rx={8} fill="#9CC2DC" />
      <Circle cx={72} cy={30} r={8.5} fill="#C9C5EE" />
      <Rect x={62} y={38} width={20} height={40} rx={10} fill="#C9C5EE" />
    </Svg>
  );
}

/** 2 · Mum&Me — a heart with a heartbeat line (the mother's own health). */
export function HerHealth({ size = 110 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Path
        d="M48 76 C16 53 23 27 42 29 c4 .5 6 3 6 6 c0-3 2-5.5 6-6 c19-2 26 24 -6 47Z"
        fill="#E6A9C4"
      />
      <Polyline
        points="22,50 32,50 37,39 43,61 48,47 51,53 74,53"
        fill="none"
        stroke="#fff"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 3 · Grows with you — three sprouts on a soft mound, the tallest in bloom. */
export function ThreeSprouts({ size = 110 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Path d="M14 76 Q48 66 82 76" stroke="#CDE6D6" strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* sprout 1 */}
      <Path d="M26 74 V60" stroke="#7FA98F" strokeWidth={3} strokeLinecap="round" />
      <Path d="M26 64 C24 59 18 58 14 60 C16 65 21 67 26 65Z" fill="#BFE0D4" />
      <Path d="M26 62 C28 58 33 57 37 59 C35 63 30 64 26 62Z" fill="#9FCBB8" />
      {/* sprout 2 */}
      <Path d="M48 74 V48" stroke="#7FA98F" strokeWidth={3.2} strokeLinecap="round" />
      <Path d="M48 60 C45 53 37 51 31 54 C34 61 41 63 48 60Z" fill="#BFE0D4" />
      <Path d="M48 56 C51 49 59 47 65 50 C62 57 55 59 48 56Z" fill="#9FCBB8" />
      {/* sprout 3 with flower */}
      <Path d="M70 74 V40" stroke="#7FA98F" strokeWidth={3.2} strokeLinecap="round" />
      <Path d="M70 60 C67 54 60 52 55 55 C58 61 64 63 70 60Z" fill="#9FCBB8" />
      <Circle cx={70} cy={33} r={5} fill="#F1B9CE" />
      <Circle cx={77} cy={37} r={5} fill="#F1B9CE" />
      <Circle cx={74} cy={44} r={5} fill="#F1B9CE" />
      <Circle cx={66} cy={44} r={5} fill="#F1B9CE" />
      <Circle cx={63} cy={37} r={5} fill="#F1B9CE" />
      <Circle cx={70} cy={39} r={4.5} fill="#F5DE8C" />
    </Svg>
  );
}

/** 4 · Made for 3am — an alarm clock pointing to 3 o'clock. */
export function NightClock({ size = 110 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx={48} cy={52} r={27} fill="#9CC2DC" />
      <Circle cx={48} cy={52} r={20} fill="#fff" />
      <Path d="M30 26 a10 10 0 0 1 11 -6" stroke="#7FA9C9" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M66 26 a10 10 0 0 0 -11 -6" stroke="#7FA9C9" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Line x1={48} y1={52} x2={48} y2={40} stroke="#43536b" strokeWidth={3.5} strokeLinecap="round" />
      <Line x1={48} y1={52} x2={60} y2={52} stroke="#43536b" strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={48} cy={52} r={2.6} fill="#43536b" />
    </Svg>
  );
}

/** 5 · Keepsake — a story journal with a bookmark. */
export function StoryJournal({ size = 110 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Rect x={26} y={16} width={46} height={62} rx={8} fill="#C9C5EE" />
      <Rect x={26} y={16} width={11} height={62} rx={5} fill="#A9A8D9" />
      <Path d="M58 16 v24 l-5.5 -5 -5.5 5 V16Z" fill="#E6A9C4" />
      <Line x1={44} y1={54} x2={64} y2={54} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <Line x1={44} y1={63} x2={58} y2={63} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
