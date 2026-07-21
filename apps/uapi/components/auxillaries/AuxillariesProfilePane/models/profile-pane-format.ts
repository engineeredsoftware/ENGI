/**
 * Pure formatters and avatar seeds for the profile auxillary pane.
 * Keeps readiness/authority label projection out of the React tree.
 */

import type {
  AuxillariesProfileState,
  OrganizationPolicyAuthority,
} from '@/app/auxillaries/auxillary-onboarding-contract';

/** Max edge for custom avatar data URLs (keeps profile payload bounded). */
export const CUSTOM_AVATAR_MAX_EDGE_PX = 256;
export const CUSTOM_AVATAR_JPEG_QUALITY = 0.84;

/**
 * Read a File as a compressed square-friendly JPEG data URL for avatar_url.
 */
export function readImageFileAsAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Avatar must be an image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read avatar file.'));
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      if (!raw) {
        reject(new Error('Empty avatar file.'));
        return;
      }
      const image = new Image();
      image.onerror = () => reject(new Error('Could not decode avatar image.'));
      image.onload = () => {
        const maxEdge = CUSTOM_AVATAR_MAX_EDGE_PX;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height, 1));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process avatar image.'));
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', CUSTOM_AVATAR_JPEG_QUALITY));
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Could not encode avatar.'));
        }
      };
      image.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Bitcode default avatars — abstract operator glyphs (not people silhouettes).
 * Each seed is a distinct protocol motif: orbit, mesh, crystal, ledger, pulse, twin-read.
 */
type AvatarGlyphId = 'orbit' | 'mesh' | 'crystal' | 'ledger' | 'pulse' | 'twin';

function avatarBackdrop(background: string, glow: string) {
  // defs first so paint-server refs resolve in every SVG image host.
  const gradientId = `bg-${glow.replace('#', '')}`;
  return `
    <defs>
      <radialGradient id="${gradientId}" cx="32%" cy="28%" r="78%">
        <stop offset="0%" stop-color="${glow}" stop-opacity="0.38"/>
        <stop offset="55%" stop-color="${glow}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${background}" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="96" height="96" rx="10" fill="${background}"/>
    <rect width="96" height="96" rx="10" fill="url(#${gradientId})" opacity="0.95"/>
  `;
}

function avatarGlyph(kind: AvatarGlyphId, accent: string, secondary: string) {
  switch (kind) {
    case 'orbit':
      // Protocol core + orbital rings (Auxillaries solar field).
      return `
        <circle cx="48" cy="48" r="30" stroke="${accent}" stroke-opacity="0.22" stroke-width="1.25" fill="none"/>
        <ellipse cx="48" cy="48" rx="38" ry="14" stroke="${accent}" stroke-opacity="0.55" stroke-width="1.5" fill="none" transform="rotate(-28 48 48)"/>
        <ellipse cx="48" cy="48" rx="38" ry="14" stroke="${secondary}" stroke-opacity="0.35" stroke-width="1.25" fill="none" transform="rotate(38 48 48)"/>
        <circle cx="48" cy="48" r="9" fill="${accent}" fill-opacity="0.95"/>
        <circle cx="48" cy="48" r="4" fill="#041018"/>
        <circle cx="78" cy="34" r="3.5" fill="${secondary}" fill-opacity="0.95"/>
        <circle cx="22" cy="58" r="2.5" fill="${accent}" fill-opacity="0.75"/>
      `;
    case 'mesh':
      // Connected repo / interface mesh.
      return `
        <path d="M24 30 L48 18 L72 30 L72 54 L48 66 L24 54 Z" stroke="${accent}" stroke-opacity="0.35" stroke-width="1.25" fill="none"/>
        <circle cx="24" cy="30" r="4" fill="${accent}"/>
        <circle cx="48" cy="18" r="4" fill="${secondary}"/>
        <circle cx="72" cy="30" r="4" fill="${accent}"/>
        <circle cx="72" cy="54" r="4" fill="${secondary}" fill-opacity="0.85"/>
        <circle cx="48" cy="66" r="4" fill="${accent}"/>
        <circle cx="24" cy="54" r="4" fill="${secondary}" fill-opacity="0.85"/>
        <circle cx="48" cy="42" r="6" fill="${accent}" fill-opacity="0.9"/>
        <path d="M24 30 L48 42 L72 30 M48 18 L48 42 L48 66 M24 54 L48 42 L72 54" stroke="${accent}" stroke-opacity="0.55" stroke-width="1.35"/>
      `;
    case 'crystal':
      // Asset-pack polyhedron / commodity facet.
      return `
        <path d="M48 14 L78 36 L66 74 L30 74 L18 36 Z" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.7" stroke-width="1.5"/>
        <path d="M48 14 L48 78 M18 36 L78 36 M30 74 L48 36 L66 74" stroke="${secondary}" stroke-opacity="0.55" stroke-width="1.2"/>
        <path d="M48 36 L66 50 L48 64 L30 50 Z" fill="${accent}" fill-opacity="0.88"/>
        <path d="M48 36 L66 50 L48 50 Z" fill="${secondary}" fill-opacity="0.55"/>
        <circle cx="48" cy="50" r="2.5" fill="#041018"/>
      `;
    case 'ledger':
      // Settlement / hash ledger ticks.
      return `
        <rect x="20" y="22" width="56" height="52" rx="4" stroke="${accent}" stroke-opacity="0.45" stroke-width="1.4" fill="${accent}" fill-opacity="0.06"/>
        <path d="M28 34 H68 M28 46 H58 M28 58 H64" stroke="${accent}" stroke-opacity="0.85" stroke-width="2.4" stroke-linecap="square"/>
        <path d="M28 34 H40 M28 46 H36 M28 58 H44" stroke="${secondary}" stroke-opacity="0.95" stroke-width="2.4" stroke-linecap="square"/>
        <rect x="60" y="52" width="10" height="10" fill="${secondary}" fill-opacity="0.9"/>
        <path d="M62 57 L65 60 L70 54" stroke="#041018" stroke-width="1.4" fill="none" stroke-linecap="square"/>
      `;
    case 'pulse':
      // Signal / measurement pulse rings.
      return `
        <circle cx="48" cy="48" r="8" fill="${accent}"/>
        <circle cx="48" cy="48" r="18" stroke="${accent}" stroke-opacity="0.75" stroke-width="1.6" fill="none"/>
        <circle cx="48" cy="48" r="28" stroke="${secondary}" stroke-opacity="0.45" stroke-width="1.3" fill="none" stroke-dasharray="4 5"/>
        <circle cx="48" cy="48" r="36" stroke="${accent}" stroke-opacity="0.28" stroke-width="1.1" fill="none" stroke-dasharray="2 6"/>
        <path d="M48 12 V22 M48 74 V84 M12 48 H22 M74 48 H84" stroke="${secondary}" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="square"/>
        <circle cx="48" cy="48" r="3" fill="#041018"/>
      `;
    case 'twin':
      // Read + Deposit twin orbits (shared system prompt / dual surface).
      return `
        <circle cx="36" cy="48" r="18" stroke="${accent}" stroke-opacity="0.8" stroke-width="1.6" fill="${accent}" fill-opacity="0.1"/>
        <circle cx="60" cy="48" r="18" stroke="${secondary}" stroke-opacity="0.8" stroke-width="1.6" fill="${secondary}" fill-opacity="0.1"/>
        <circle cx="36" cy="48" r="6" fill="${accent}"/>
        <circle cx="60" cy="48" r="6" fill="${secondary}"/>
        <path d="M42 48 H54" stroke="#e2e8f0" stroke-opacity="0.55" stroke-width="1.5"/>
        <path d="M48 28 C56 34 56 62 48 68 C40 62 40 34 48 28 Z" fill="none" stroke="#94a3b8" stroke-opacity="0.35" stroke-width="1.1"/>
      `;
    default:
      return '';
  }
}

/**
 * CSS `url(...)` must quote data URIs: encodeURIComponent leaves `()` unescaped,
 * so unquoted `url(data:...url(%23id)...)` truncates at the first `)` and the
 * preset glyphs render as empty tiles.
 */
export function toCssBackgroundImage(src: string): string {
  const trimmed = typeof src === 'string' ? src.trim() : '';
  if (!trimmed) return 'none';
  const escaped = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `url("${escaped}")`;
}

function utf8ToBase64(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64');
  }
  // Browser path — TextEncoder avoids deprecated unescape/encodeURIComponent hacks.
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function buildAvatarDataUri(
  label: string,
  kind: AvatarGlyphId,
  background: string,
  accent: string,
  secondary: string,
  glow: string,
) {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">',
    avatarBackdrop(background, glow),
    avatarGlyph(kind, accent, secondary),
    `<text x="48" y="90" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="8" letter-spacing="0.12em" fill="${accent}" fill-opacity="0.55">${label}</text>`,
    '</svg>',
  ].join('');

  // Base64 keeps CSS url() hosts free of raw `()` / `#` that break unquoted urls.
  return `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;
}

/** Six preset operator glyphs for profile / chrome (square Bitcode tile language). */
export const PROFILE_AVATAR_OPTIONS = [
  buildAvatarDataUri('A1', 'orbit', '#040a13', '#67feb7', '#34d399', '#067a4f'),
  buildAvatarDataUri('A2', 'mesh', '#050d18', '#38bdf8', '#818cf8', '#0e4a6e'),
  buildAvatarDataUri('A3', 'crystal', '#0a0c14', '#fbbf24', '#f97316', '#6b4a0a'),
  buildAvatarDataUri('A4', 'ledger', '#080612', '#c084fc', '#e879f9', '#4c1d6b'),
  buildAvatarDataUri('A5', 'pulse', '#0b0610', '#fb7185', '#f43f5e', '#6b1530'),
  buildAvatarDataUri('A6', 'twin', '#041216', '#22d3ee', '#67feb7', '#0e5c5c'),
];

/**
 * Index of a preset avatar URL, or -1 when custom/unknown (upload data URL).
 */
export function indexOfProfileAvatar(avatarUrl: string | null | undefined): number {
  const trimmed = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';
  if (!trimmed) return 0;
  return PROFILE_AVATAR_OPTIONS.indexOf(trimmed);
}

export function readProfileReadinessLabel(state: AuxillariesProfileState | null | undefined) {
  if (!state) return 'Loading account state';
  if (state.accountReadiness === 'ready') return 'Ready';
  if (state.accountReadiness === 'degraded') return 'Needs repair';
  if (state.accountReadiness === 'blocked') return 'Blocked';
  return 'Unknown';
}

export function readPolicyDecisionLabel(authority: OrganizationPolicyAuthority | null | undefined) {
  if (!authority) return 'Not projected';
  if (authority.policyDecision === 'allowed') return 'Allowed';
  return 'Denied';
}

export function formatAuthorityValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'n/a';
}

export function formatAuthorityList(values: string[] | null | undefined) {
  return values?.length ? values.join(', ') : 'none';
}
