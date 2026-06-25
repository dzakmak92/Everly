import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { TREE_PATH } from '../theme/logoPath';

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

/**
 * Everly tree-of-life mark (twisted roots, intertwined trunk, central
 * raised-arms figure, rounded canopy). Single-path, `currentColor`-style fill.
 * viewBox 0 0 340 385.
 */
export function Logo({ width = 28, height = 32, color = '#8AA87C' }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 340 385">
      <Path d={TREE_PATH} fill={color} fillRule="evenodd" />
    </Svg>
  );
}
