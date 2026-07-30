/**
 * Buyer honesty: volume-0 estimated rows must not look like soft quality claims.
 */
import { normalizeAbsoluteHonestyStatuses } from '../../agents/validation/agent-measure-absolutes';
import type { AssetPackCandidateMeasurement } from '../../asset-pack-measurements';

function row(
  partial: Partial<AssetPackCandidateMeasurement> & {
    measurementKind: string;
  },
): AssetPackCandidateMeasurement {
  return {
    measurementKind: partial.measurementKind,
    label: partial.label || partial.measurementKind,
    weight: partial.weight ?? 0.01,
    volume: partial.volume ?? 0,
    magnitude: partial.magnitude ?? partial.volume ?? 0,
    category: 'absolute',
    unit: partial.unit || 'normalized',
    status: partial.status,
  };
}

describe('normalizeAbsoluteHonestyStatuses', () => {
  it('downgrades estimated volume 0 to insufficient_evidence', () => {
    const out = normalizeAbsoluteHonestyStatuses([
      row({ measurementKind: 'secret-safety', volume: 0, status: 'estimated' }),
    ]);
    expect(out[0].status).toBe('insufficient_evidence');
  });

  it('keeps non-zero estimated as estimated', () => {
    const out = normalizeAbsoluteHonestyStatuses([
      row({ measurementKind: 'correctness-estimate', volume: 0.6, status: 'estimated' }),
    ]);
    expect(out[0].status).toBe('estimated');
  });

  it('does not downgrade measured zeros', () => {
    const out = normalizeAbsoluteHonestyStatuses([
      row({ measurementKind: 'function-count', volume: 0, magnitude: 0, status: 'measured' }),
    ]);
    expect(out[0].status).toBe('measured');
  });

  it('leaves expanded-fill unchanged', () => {
    const out = normalizeAbsoluteHonestyStatuses([
      row({ measurementKind: 'lang-span', volume: 0, status: 'expanded-fill' }),
    ]);
    expect(out[0].status).toBe('expanded-fill');
  });
});
