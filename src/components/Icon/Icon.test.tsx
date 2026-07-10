import React from 'react';
import Svg from 'react-native-svg';
import { render } from '@testing-library/react-native';

import { Icon } from './Icon';
import { icons, type IconName } from './icons';

describe('Icon', () => {
  it.each(Object.keys(icons) as IconName[])(
    'renders the "%s" icon without throwing',
    name => {
      const { UNSAFE_getByType } = render(<Icon name={name} />);
      expect(UNSAFE_getByType(Svg)).toBeTruthy();
    },
  );

  it('resolves pixel size and color from the given tokens', () => {
    const { UNSAFE_getByType } = render(
      <Icon name="bell" size="icon-size-lg" color="font-brand" />,
    );
    const svg = UNSAFE_getByType(Svg);
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });
});
