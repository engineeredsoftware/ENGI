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

function buildAvatarDataUri(seed: string, background: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
      <rect width="96" height="96" rx="28" fill="${background}"/>
      <circle cx="48" cy="34" r="16" fill="${accent}" fill-opacity="0.94"/>
      <path d="M20 80c3-18 16-28 28-28s25 10 28 28" fill="${accent}" fill-opacity="0.76"/>
      <text x="48" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white" fill-opacity="0.72">${seed}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const PROFILE_AVATAR_OPTIONS = [
  buildAvatarDataUri('A1', '#0f172a', '#67feb7'),
  buildAvatarDataUri('A2', '#111827', '#38bdf8'),
  buildAvatarDataUri('A3', '#1f2937', '#f9c855'),
  buildAvatarDataUri('A4', '#172033', '#c084fc'),
  buildAvatarDataUri('A5', '#0b1324', '#fb7185'),
  buildAvatarDataUri('A6', '#112131', '#22d3ee'),
];

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
