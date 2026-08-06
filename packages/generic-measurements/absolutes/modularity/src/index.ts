/**
 * Bare absolute measure: `modularity` of a synthesized **DataPack**.
 * Family: structure. Policy: weighted. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'modularity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Modularity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'modules' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

export function measureAbsoluteModularity(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const paths = [...(input.dataPack.coveredSourcePaths||[]), ...((input.dataPack.fileChanges||[]).map(c=>c.path))];
  const modules = new Set<string>();
  for (const raw of paths) {
    const path = String(raw||'').replace(/^\/+/, ''); if (!path) continue;
    const s = path.indexOf('/'); modules.add(s === -1 ? path : path.slice(0,s));
  }
  const magnitude = Math.max(1, modules.size);
  return { measurementKind: 'modularity', magnitude, volume: clamp01(magnitude / 12),
    rationale: `DataPack modularity=${magnitude}.`, status: 'measured', policyRole: 'weighted' };
}

export default measureAbsoluteModularity;
