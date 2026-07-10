/**
 * Icon shape data — Feather-style, 24x24 viewBox, stroke-based glyphs.
 *
 * Plain data, not components: `Icon.tsx` maps each shape to the matching
 * `react-native-svg` primitive at render time.
 */

export type IconName =
  | 'list'
  | 'grid'
  | 'bell'
  | 'chevron-down'
  | 'check'
  | 'close'
  | 'plus'
  | 'users'
  | 'paperclip';

export type IconShape =
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | {
      type: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
    }
  | { type: 'polyline'; points: string }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'path'; d: string };

export const icons: Record<IconName, IconShape[]> = {
  list: [
    { type: 'line', x1: 8, y1: 6, x2: 21, y2: 6 },
    { type: 'line', x1: 8, y1: 12, x2: 21, y2: 12 },
    { type: 'line', x1: 8, y1: 18, x2: 21, y2: 18 },
    { type: 'line', x1: 3, y1: 6, x2: 3.01, y2: 6 },
    { type: 'line', x1: 3, y1: 12, x2: 3.01, y2: 12 },
    { type: 'line', x1: 3, y1: 18, x2: 3.01, y2: 18 },
  ],
  grid: [
    { type: 'rect', x: 3, y: 3, width: 7, height: 7, rx: 1 },
    { type: 'rect', x: 14, y: 3, width: 7, height: 7, rx: 1 },
    { type: 'rect', x: 14, y: 14, width: 7, height: 7, rx: 1 },
    { type: 'rect', x: 3, y: 14, width: 7, height: 7, rx: 1 },
  ],
  bell: [
    { type: 'path', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' },
    { type: 'path', d: 'M13.73 21a2 2 0 0 1-3.46 0' },
  ],
  'chevron-down': [{ type: 'polyline', points: '6 9 12 15 18 9' }],
  check: [{ type: 'polyline', points: '20 6 9 17 4 12' }],
  close: [
    { type: 'line', x1: 18, y1: 6, x2: 6, y2: 18 },
    { type: 'line', x1: 6, y1: 6, x2: 18, y2: 18 },
  ],
  plus: [
    { type: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { type: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  users: [
    { type: 'path', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 9, cy: 7, r: 4 },
    { type: 'path', d: 'M23 21v-2a4 4 0 0 0-3-3.87' },
    { type: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  paperclip: [
    {
      type: 'path',
      d: 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48',
    },
  ],
};
