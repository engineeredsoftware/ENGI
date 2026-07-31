/**
 * @jest-environment node
 */
import runStore from '../agents/finish/deposit-store-artifacts-agent';
import runLedgerize from '@bitcode/asset-packs-pipelines-syntheses-domain/agents/finish/asset-packs-ledgerize-agent';
import runFinish from '../agents/finish/deposit-finish-synthesize-run-agent';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

function execStub(initial: Record<string, Record<string, unknown>> = {}) {
  const store = new Map<string, unknown>();
  for (const [ns, bag] of Object.entries(initial)) {
    for (const [k, v] of Object.entries(bag)) store.set(`${ns}:${k}`, v);
  }
  return {
    id: 'run-test-1',
    store: (ns: string, key: string, value: unknown) => {
      store.set(`${ns}:${key}`, value);
    },
    get: (ns: string, key: string) => store.get(`${ns}:${key}`),
    findUp: (ns: string, key: string) => store.get(`${ns}:${key}`),
  };
}

/** Full commercial catalogue (46) — finish presentability law. */
const FULL_ABSOLUTES = DATA_PACK_ABSOLUTES_CATALOG.map((spec) => ({
  measurementKind: spec.measurementKind,
  label: spec.label,
  weight: spec.weight,
  volume: 0.5,
  magnitude: 0.5,
  unit: spec.unit,
  category: 'absolute' as const,
}));

describe('deposit finish agents (store → ledgerize → finish)', () => {
  const options = [
    {
      kind: 'capability-slice',
      title: 'Billing capability',
      summary: 'Source-safe billing capability slice for deposit review.',
      coveredSourcePaths: ['src/bill.ts'],
      confidence: 0.8,
      patch: {
        fileChanges: [{ path: 'src/bill.ts', op: 'modify' }],
        patchSummary: 'Encodes billing capability.',
      },
      // Formal patchfile handle required for presentable law.
      patchArtifact: {
        artifactId: 'artifact-patch-bill',
        assetPackId: 'ap-bill',
        schema: 'bitcode.artifact.patch',
        productSchema: 'bitcode.artifact.patch.asset-pack',
        format: 'path-op-json',
        patchSummary: 'Encodes billing capability.',
        fileCount: 1,
        files: [{ path: 'src/bill.ts', op: 'modify' }],
        name: 'bill.patch.json',
        envelopeJson: '{"artifactId":"artifact-patch-bill"}',
      },
      // Nested kinds only — DataPack = patch + measurements + metadata.
      measurements: {
        absolutes: FULL_ABSOLUTES,
      },
    },
  ];

  it('store-artifacts builds bundle and optional persist hook', async () => {
    const persistArtifacts = jest.fn(async () => ({ ok: true, detail: 'upserted' }));
    const exec = execStub({
      implementation: { options },
      deposit: {
        sourceCheckoutCatalog: { paths: ['src/bill.ts'], samples: [], sources: [] },
        persistArtifacts,
      },
      discovery: { codebaseComprehension: { summary: 'ok' } },
      setup: { admission: { safe: true } },
      validation: { readyToFinish: { recommendation: 'finish' } },
    });

    const out = await runStore({}, exec);
    expect(out.success).toBe(true);
    expect(exec.get('finish', 'storedArtifacts')?.assetPacks).toHaveLength(1);
    expect(exec.get('finish', 'storedArtifacts')?.patches?.[0]?.patch).toBeTruthy();
    expect(persistArtifacts).toHaveBeenCalled();
    expect(exec.get('finish', 'persistResult')?.mode).toBe('hook');
  });

  it('ledgerize requires storedArtifacts and supports ledgerWrite hook', async () => {
    const exec = execStub({
      implementation: { options },
    });
    const blocked = await runLedgerize({}, exec);
    expect(blocked.success).toBe(false);
    expect(exec.get('finish', 'ledgerize')?.status).toBe('blocked');

    const ledgerWrite = jest.fn(async () => ({ ok: true, txId: 'tx-1', detail: 'anchored' }));
    const exec2 = execStub({
      implementation: { options },
      deposit: { ledgerWrite, repository: { fullName: 'o/r' } },
    });
    await runStore({}, exec2);
    const out = await runLedgerize({}, exec2);
    expect(out.success).toBe(true);
    expect(ledgerWrite).toHaveBeenCalled();
    expect(exec2.get('finish', 'ledgerize')?.status).toBe('written');
    expect(exec2.get('finish', 'ledgerWriteResult')?.txId).toBe('tx-1');
  });

  it('finish-synthesize builds selection envelope without new content', async () => {
    const exec = execStub({
      implementation: {
        options,
        measured: true,
        presentable: true,
        salvaged: false,
        salvageCount: 0,
      },
      validation: {
        readyToFinish: {
          recommendation: 'finish',
          summary: 'ok',
          finalApproval: true,
          readyToFinish: true,
        },
      },
      deposit: { repository: { fullName: 'o/r' } },
    });
    await runStore({}, exec);
    await runLedgerize({}, exec);
    const out = await runFinish({}, exec);
    expect(out.success).toBe(true);
    expect(out.resultState).toBe('worthy_deposit_candidates');
    expect(out.readyToPresent).toBe(true);
    const envelope = exec.get('finish', 'selectionEnvelope');
    expect(envelope.options).toHaveLength(1);
    expect(envelope.options[0].patch).toBeTruthy();
    expect(envelope.options[0].measurements?.absolutes).toHaveLength(DATA_PACK_ABSOLUTES_CATALOG.length);
    // Legal deposit bag: absolutes required; materialIdentity / measureReport optional.
    expect(Object.keys(envelope.options[0].measurements)).toContain('absolutes');
    expect(envelope.options[0].measurements.absolutes).toBeDefined();
    expect(envelope.options[0].selectable).toBe(true);
    expect(exec.get('finish', 'completion')?.cleanup?.disposeRecommended).toBeDefined();
  });

  it('finish refuses readyToPresent when packs are salvaged', async () => {
    const salvaged = [
      {
        ...options[0],
        salvaged: true,
        salvageReason: 'host-salvage',
      },
    ];
    const exec = execStub({
      implementation: {
        options: salvaged,
        measured: true,
        presentable: false,
        salvaged: true,
        salvageCount: 1,
      },
      validation: {
        readyToFinish: { recommendation: 'finish', finalApproval: true, readyToFinish: true },
      },
      deposit: { repository: { fullName: 'o/r' } },
    });
    const out = await runFinish({}, exec);
    expect(out.readyToPresent).toBe(false);
    expect(out.selectionEnvelope.options[0].selectable).toBe(false);
  });
});
