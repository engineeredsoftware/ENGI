/**
 * @jest-environment node
 */

import {
  PROFILE_AVATAR_OPTIONS,
  toCssBackgroundImage,
} from '@/components/auxillaries/AuxillariesProfilePane/models/profile-pane-format';

describe('PROFILE_AVATAR_OPTIONS', () => {
  it('exposes six base64 SVG presets safe for CSS url()', () => {
    expect(PROFILE_AVATAR_OPTIONS).toHaveLength(6);
    for (const option of PROFILE_AVATAR_OPTIONS) {
      expect(option.startsWith('data:image/svg+xml;base64,')).toBe(true);
      // Base64 alphabet must not reintroduce CSS url() breakers.
      expect(option).not.toMatch(/[()#\s]/);
    }
  });

  it('quotes CSS background urls so parentheses cannot truncate url()', () => {
    const brokenSvgData =
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><circle r="1" fill="url(#g)"/></svg>');
    // Unquoted form is what empty avatar tiles used to hit.
    expect(brokenSvgData).toContain('(');
    expect(toCssBackgroundImage(brokenSvgData)).toBe(`url("${brokenSvgData}")`);
    expect(toCssBackgroundImage(PROFILE_AVATAR_OPTIONS[0])).toMatch(/^url\("data:image\/svg\+xml;base64,/);
  });
});
