/**
 * Tone → className helper for docs embedded UI signal chips.
 */
import type { DocsEmbeddedUiSpecimen } from '@/components/docs/models/bitcode-docs-types';

export function signalToneClassName(
  tone: NonNullable<DocsEmbeddedUiSpecimen['signals']>[number]['tone'],
) {
  if (tone === 'emerald') {
    return 'border-emerald-300/16 bg-emerald-400/[0.06] text-emerald-50';
  }
  if (tone === 'amber') {
    return 'border-amber-300/16 bg-amber-400/[0.06] text-amber-50';
  }
  if (tone === 'cyan') {
    return 'border-cyan-300/16 bg-cyan-400/[0.06] text-cyan-50';
  }
  return 'border-white/10 bg-white/[0.045] text-white/78';
}
