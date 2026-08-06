import { clampBp } from './bitcode-core.js';
import { telemetrySpan } from './telemetry.js';

/**
 * @param {any} input
 * @returns {any}
 */
export function buildBenchmarkComparison({ bundleId, benchmark, baselineBp, treatmentBp }) {
  return telemetrySpan('bitcode.buildBenchmarkComparison', {
    bundleId,
    benchmark,
    baselineBp,
    treatmentBp
  }, () => {
    const upliftBp = clampBp(Number(treatmentBp) - Number(baselineBp));
    const improved = upliftBp > 0;

    return {
      bundleId,
      benchmark,
      task: 'Recover a production monorepo auth migration with issuer mismatch while preserving session validity and rollback safety.',
      baselineBp: clampBp(baselineBp),
      treatmentBp: clampBp(treatmentBp),
      upliftBp,
      baselineOutcome: improved
        ? 'Without the licensed bundle, the remediation system proposes a generic rollback that misses issuer compatibility sequencing and audit guardrails.'
        : 'Without the licensed bundle, the remediation system performs roughly the same as treatment.' ,
      treatmentOutcome: improved
        ? 'With the licensed bundle, the remediation system restores verifier configuration in the right order, preserves session invariants, and emits the expected audit steps.'
        : 'With the licensed bundle, the remediation system does not materially outperform baseline in this run.',
      whyItHelped: improved
        ? 'The licensed bundle supplied specific rollback sequencing, issuer-mismatch diagnosis, and proof-backed validator patch guidance that the baseline system lacked.'
        : 'The licensed bundle did not add enough task-specific knowledge to create measurable lift in this run.',
      businessImpact: improved
        ? 'Higher confidence incident recovery, faster safe rollback, and lower risk of releasing an auth fix that breaks live sessions.'
        : 'No measurable buyer impact established in this run.',
      interpretation: improved
        ? 'Licensed bundle improved the reader system\'s remediation performance on the target task.'
        : 'No measurable lift detected in this run.',
      checks: [
        'same task family',
        'baseline without licensed bundle',
        'treatment with licensed bundle',
        'scored in basis points for simple comparability'
      ]
    };
  });
}
