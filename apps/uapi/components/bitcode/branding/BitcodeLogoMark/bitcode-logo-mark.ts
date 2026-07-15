/**
 * Bitcode product logo mark (geometric "B" monogram).
 *
 * Replaces the legacy Engi circular-e path used in old favicons / OG previews.
 * Keep `apps/uapi/public/{logo,icon,apple-touch,og-image}*` in lockstep.
 */

export const BITCODE_LOGO_VIEW_BOX = '0 0 64 64';
/** Scale/position the evenodd B into the 64×64 viewBox. */
export const BITCODE_LOGO_TRANSFORM = 'scale(0.78) translate(6 2)';
export const BITCODE_LOGO_INTRINSIC_WIDTH = 64;
export const BITCODE_LOGO_INTRINSIC_HEIGHT = 64;

/**
 * Compound geometric Bitcode "B" with evenodd counters (outer + two holes).
 * Render with fillRule="evenodd".
 */
export const BITCODE_LOGO_PATH =
  'M18 10H35C47 10 55 17.5 55 27C55 33.5 51 38.2 44.5 40.2C52.5 42.2 58 48.2 58 56.5C58 67 49.5 74 35.5 74H18V10ZM28 19V35H35C41.5 35 45.5 31.5 45.5 27C45.5 22.4 41.3 19 35 19H28ZM28 44V65H36C43.5 65 48 60.5 48 54.5C48 48.3 43.2 44 36 44H28Z';

/** SVG fill-rule for the compound path above. */
export const BITCODE_LOGO_FILL_RULE: 'evenodd' = 'evenodd';

export function normalizeLogoColor(fill: string) {
  if (fill === 'theme(colors.brand.emerald)') return '#65FEB7';
  if (fill === 'theme(colors.brand.red)') return '#EF4444';
  return fill;
}
