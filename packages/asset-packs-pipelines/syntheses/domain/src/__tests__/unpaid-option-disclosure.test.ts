/**
 * Unpaid READ disclosure law tests (V48-Gate5-F01).
 */

import {
  buildUnpaidReadSelectionEnvelope,
  computeCoverageRatio,
  isUnpaidReadSynthesisExecution,
  redactUnpaidReadExecutionOutput,
  scrubPathTokens,
  toUnpaidReadOptionPresentation,
  unpaidOptionContainsForbiddenFields,
} from '../unpaid-option-disclosure';

const FULL_OPTION = {
  index: 0,
  kind: 'capability',
  title: 'Ledger reconcile',
  summary: 'Adds reconcile in src/ledger/reconcile.ts for cash',
  coveredSourcePaths: ['src/ledger/reconcile.ts', 'src/ledger/index.ts'],
  confidence: 0.82,
  needFit: 0.71,
  patch: {
    patchSummary: 'wire reconcile',
    fileChanges: [{ op: 'modify', path: 'src/ledger/reconcile.ts' }],
  },
  measurements: {
    absolutes: [
      {
        label: 'LOC in src/ledger/reconcile.ts',
        volume: 0.4,
        rationale: 'Touches packages/app/foo.ts heavily',
      },
    ],
    needinesses: [{ label: 'need-fit', volume: 0.71 }],
  },
};

describe('unpaid-option-disclosure', () => {
  it('scrubs path-like tokens', () => {
    expect(scrubPathTokens('see src/ledger/reconcile.ts for detail')).toContain('[path]');
    expect(scrubPathTokens('see src/ledger/reconcile.ts for detail')).not.toContain(
      'reconcile.ts',
    );
  });

  it('computes coverage ratio or omits', () => {
    expect(computeCoverageRatio({ coveredPathCount: 2, catalogSourcePathCount: 10 })).toBe(0.2);
    expect(computeCoverageRatio({ coveredPathCount: 2, catalogSourcePathCount: 0 })).toBeNull();
    expect(computeCoverageRatio({ coveredPathCount: null, catalogSourcePathCount: 10 })).toBeNull();
  });

  it('projects unpaid option without forbidden fields', () => {
    const unpaid = toUnpaidReadOptionPresentation(FULL_OPTION, 0, 10);
    expect(unpaid.title).toBe('Ledger reconcile');
    expect(unpaid.coveragePercent).toBe(20);
    expect(unpaid.patch).toBeUndefined();
    expect(unpaid.coveredSourcePaths).toBeUndefined();
    expect(unpaidOptionContainsForbiddenFields(unpaid)).toBe(false);
    const abs = (unpaid.measurements as { absolutes: Array<{ label?: string; rationale?: string }> })
      .absolutes[0];
    expect(abs.label).not.toMatch(/reconcile\.ts/);
    expect(abs.rationale).not.toMatch(/foo\.ts/);
  });

  it('omits coverage when catalog missing', () => {
    const unpaid = toUnpaidReadOptionPresentation(FULL_OPTION, 0, null);
    expect(unpaid.coverageRatio).toBeUndefined();
    expect(unpaid.coveragePercent).toBeUndefined();
  });

  it('builds dual envelope with fullOptions retained', () => {
    const { selectionEnvelope, unpaidOptions, fullOptions } = buildUnpaidReadSelectionEnvelope({
      options: [FULL_OPTION],
      need: 'cash reconcile',
      catalogSourcePathCount: 10,
    });
    expect(fullOptions).toHaveLength(1);
    expect((fullOptions[0] as { patch?: unknown }).patch).toBeTruthy();
    expect(selectionEnvelope.options).toEqual(unpaidOptions);
    expect(unpaidOptionContainsForbiddenFields(selectionEnvelope)).toBe(false);
  });

  it('redacts execution output forever', () => {
    const redacted = redactUnpaidReadExecutionOutput({
      productPipeline: 'synthesize-reads-asset-packs-pipeline',
      options: [FULL_OPTION],
      fullOptions: [FULL_OPTION],
      selectionEnvelope: { options: [FULL_OPTION] },
      catalogSourcePathCount: 10,
    });
    expect(redacted?.fullOptions).toBeUndefined();
    expect(unpaidOptionContainsForbiddenFields(redacted)).toBe(false);
    expect(Array.isArray(redacted?.options)).toBe(true);
  });

  it('detects unpaid read synthesis executions', () => {
    expect(
      isUnpaidReadSynthesisExecution({
        context: { source: 'read-synthesize-options', synthesisMode: 'read' },
      }),
    ).toBe(true);
    expect(
      isUnpaidReadSynthesisExecution({
        output: { productPipeline: 'synthesize-reads-asset-packs-pipeline' },
      }),
    ).toBe(true);
    expect(
      isUnpaidReadSynthesisExecution({
        context: { source: 'deposit-synthesize-options', synthesisMode: 'deposit' },
      }),
    ).toBe(false);
  });

  it('scrubs legacy options-only rows into fullOptions + unpaid options (R2)', () => {
    // Inline scrub shape (matches apps/uapi lib) using domain projectors.
    const commercial = [FULL_OPTION];
    const unpaid = commercial.map((o, i) => toUnpaidReadOptionPresentation(o, i, 10));
    const stored = {
      options: unpaid,
      fullOptions: commercial,
    };
    expect((stored.fullOptions[0] as { patch?: unknown }).patch).toBeTruthy();
    expect(unpaidOptionContainsForbiddenFields(stored.options)).toBe(false);
  });

  it('never classifies settle runs as unpaid read synthesis (R1)', () => {
    expect(
      isUnpaidReadSynthesisExecution({
        context: {
          source: 'read-settle-asset-pack',
          route: '/reads',
          synthesisMode: 'read',
          pipelineCore: 'settle-asset-pack-pipeline',
        },
        output: {
          productPipeline: 'settle-asset-pack-pipeline',
          entitledPatch: { patchSummary: 'secret commercial' },
        },
      }),
    ).toBe(false);
    // synthesisMode alone must not match
    expect(
      isUnpaidReadSynthesisExecution({
        context: { synthesisMode: 'read', route: '/reads' },
      }),
    ).toBe(false);
  });
});
