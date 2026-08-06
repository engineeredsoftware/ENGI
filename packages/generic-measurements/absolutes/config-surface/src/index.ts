/**
 * Bare absolute measure: `config-surface` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity|hygiene|verification|provenance|value as catalog.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'config-surface' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Config surface' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'keys' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteConfigSurface(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['config-surface']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'config-surface',
      magnitude,
      volume: clamp01(magnitude / 24),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'target',
    };
  }
  const sources = input.sources || [];
  const paths = [
    ...(input.dataPack.coveredSourcePaths || []),
    ...((input.dataPack.fileChanges || []).map((c) => c.path)),
  ];
  const configPaths = paths.filter((p) =>
    /(\.(env|ya?ml|toml|ini|cfg|config)|config\.|settings\.|tsconfig|package\.json|Dockerfile)/i.test(String(p)),
  );
  let keys = configPaths.length;
  for (const f of sources) {
    if (!/(\.(env|ya?ml|toml|ini|cfg|config)|config\.|settings\.|tsconfig|package\.json)/i.test(f.path)) continue;
    const c = f.content || '';
    keys += (c.match(/^\s*["']?[A-Za-z_][\w.-]*["']?\s*[:=]/gm) || []).length;
  }
  if (!sources.length && configPaths.length === 0) return emptyInsufficient('config-surface');
  const magnitude = Math.round(keys);
  return {
    measurementKind: 'config-surface',
    magnitude,
    volume: clamp01(magnitude / 24),
    rationale: 'heuristic config path/key surface on DataPack',
    status: sources.length ? 'estimated' : 'measured',
    policyRole: 'target',
  };
}

export default measureAbsoluteConfigSurface;
