import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import type { FontColorToken, IconSizeToken } from 'theme/tokens';

import { icons, type IconName } from './icons';
import { useIconTheme } from './theme/useIconTheme';

interface IconProps {
  name: IconName;
  size?: IconSizeToken;
  color?: FontColorToken;
}

/** The app's themed icon. Renders a small set of hand-authored SVG glyphs. */
export const Icon = ({
  name,
  size = 'icon-size-md',
  color = 'font-primary',
}: IconProps) => {
  const { pixelSize, colorValue } = useIconTheme(size, color);

  return (
    <Svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none">
      {icons[name].map((shape, index) => {
        switch (shape.type) {
          case 'line':
            return (
              <Line
                key={index}
                x1={shape.x1}
                y1={shape.y1}
                x2={shape.x2}
                y2={shape.y2}
                stroke={colorValue}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          case 'rect':
            return (
              <Rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                stroke={colorValue}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          case 'polyline':
            return (
              <Polyline
                key={index}
                points={shape.points}
                stroke={colorValue}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          case 'circle':
            return (
              <Circle
                key={index}
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                stroke={colorValue}
                strokeWidth={2}
              />
            );
          case 'path':
            return (
              <Path
                key={index}
                d={shape.d}
                stroke={colorValue}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
        }
      })}
    </Svg>
  );
};
