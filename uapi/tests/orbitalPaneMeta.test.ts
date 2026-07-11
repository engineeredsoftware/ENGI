import {
  buildAuxillariesRoutePath,
  getAuxillaryOpenActionLabel,
  getAuxillaryRouteSegment,
  readAuxillaryOverlayStep,
  normalizeAuxillaryPane,
} from '@/app/auxillaries/components/auxillary-pane-meta';

describe('auxillary-pane-meta canonical routing', () => {
  it('uses profile as the canonical profile route segment', () => {
    expect(getAuxillaryRouteSegment('profile')).toBe('profile');
  });

  it('accepts only canonical auxillary route segments', () => {
    expect(normalizeAuxillaryPane('profile')).toBe('profile');
    expect(normalizeAuxillaryPane('externals')).toBe('externals');
    expect(normalizeAuxillaryPane('interfaces')).toBe('interfaces');
    expect(normalizeAuxillaryPane('wallet')).toBe('wallet');
    expect(normalizeAuxillaryPane('users')).toBeNull();
    expect(normalizeAuxillaryPane('models')).toBeNull();
    expect(normalizeAuxillaryPane('credits')).toBeNull();
  });

  it('keeps orbital entry actions user-facing and specific when a target orbital is provided', () => {
    expect(getAuxillaryOpenActionLabel()).toBe('Open Auxillaries fullscreen');
    expect(getAuxillaryOpenActionLabel('externals')).toBe('Open Externals fullscreen');
  });

  it('builds overlay targets instead of standalone auxillaries pages', () => {
    expect(buildAuxillariesRoutePath('wallet')).toBe('/packs?auxillary-open-to=wallet');
    expect(buildAuxillariesRoutePath('connects')).toBe('/packs?auxillary-open-to=externals');
    expect(readAuxillaryOverlayStep(new URLSearchParams('auxillary-open-to=btd'))).toBe('wallet');
  });
});
