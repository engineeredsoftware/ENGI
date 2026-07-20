/**
 * Generate a source-safe, **instance** descriptor for one absolute reading on
 * a specific AssetPack option. Bound to measured magnitude/volume/weight —
 * never catalog prose about AssetPacks in general, never raw source.
 */

export type SourceSafeAbsoluteDescriptorInput = {
  measurementKind: string;
  label: string;
  unit: string;
  magnitude: number;
  volume: number;
  weight: number;
  /** Optional option title (source-safe metadata only). */
  packTitle?: string | null;
};

function pct(volume: number): number {
  const n = Number.isFinite(volume) ? volume : 0;
  return Math.round(Math.max(0, Math.min(1, n)) * 100);
}

function mag(magnitude: number): string {
  if (!Number.isFinite(magnitude)) return '0';
  // Quantities are integer counts; quality magnitudes may be 0..1.
  if (Math.abs(magnitude - Math.round(magnitude)) < 1e-9) {
    return String(Math.max(0, Math.round(magnitude)));
  }
  return Number(magnitude).toFixed(2);
}

/**
 * Build buyer-facing prose for **this** measured reading.
 * Call when/after taking measurements; attach on the absolute row.
 */
export function buildSourceSafeAbsoluteDescriptor(
  input: SourceSafeAbsoluteDescriptorInput,
): string {
  const label = input.label || input.measurementKind;
  const unit = input.unit || 'units';
  const m = mag(input.magnitude);
  const vPct = pct(input.volume);
  const w =
    typeof input.weight === 'number' && Number.isFinite(input.weight)
      ? input.weight.toFixed(2)
      : '—';
  const title =
    typeof input.packTitle === 'string' && input.packTitle.trim()
      ? `"${input.packTitle.trim()}"`
      : 'this AssetPack option';

  switch (input.measurementKind) {
    case 'function-count':
      return (
        `${title} measures ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        `Source-safe count of distinct behaviors encoded in this option's patch slice — not full-repository size.`
      );
    case 'type-count':
      return (
        `${title} measures ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        `Source-safe type/interface/schema surface for this option's patch — structural reuse without unpaid bodies.`
      );
    case 'file-span':
      return (
        `${title} spans ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        `How many files this option's patch creates or modifies — compact stays reviewable; broader covers more boundary for this pack only.`
      );
    case 'symbolic-richness':
      return (
        `${title} has ${m} unique ${unit} (volume ${vPct}%, weight ${w}). ` +
        `Source-safe symbol density for this option's patch graph — transferable structure without protected bodies.`
      );
    case 'modularity':
      return (
        `${title} covers ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        `Coherent module span for this option's patch — multi-module implies clearer seams; one module means tightly scoped.`
      );
    case 'correctness-estimate':
      return (
        `${title} correctness estimate ${m} (${unit}; volume ${vPct}%, weight ${w}). ` +
        `Source-safe coherence/internal-consistency reading for this option (honesty class: estimate) — not a runtime proof.`
      );
    case 'objectives-fidelity':
      return (
        `${title} objectives fidelity ${m} (${unit}; volume ${vPct}%, weight ${w}). ` +
        `How well this option serves its deposit objectives while holding exclusions and source-safety. Low scores: steer or resynthesize before settle.`
      );
    case 'computational-usage':
      return (
        `${title} computational usage ${m} (${unit}; volume ${vPct}%, weight ${w}). ` +
        `Estimated demand of applying or reasoning over this option — plan settlement and delivery cost for this pack.`
      );
    default:
      return (
        `${title} ${label}: magnitude ${m} ${unit}, volume ${vPct}%, weight ${w}. ` +
        `Source-safe absolute reading attached to this AssetPack option.`
      );
  }
}
