import { buildAssetPackSandboxHostPlan } from '../asset-pack-host-plan';
import ts from 'typescript';

const baseOptions = {
  read: {
    id: 'read-1',
    prompt: 'Read the deposited repository revision.',
  },
  deposit: {
    id: 'deposit-1',
  },
  sourceRevision: {
    repositoryFullName: 'engineeredsoftware/ENGI',
    branch: 'main',
    commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  },
};

describe('asset-pack sandbox host plan', () => {
  it('builds a host smoke plan that exports manifest and artifact paths', () => {
    const plan = buildAssetPackSandboxHostPlan(baseOptions);

    expect(plan.createOptions.runtime).toBe('node24');
    expect(plan.createOptions.timeout).toBe(45 * 60 * 1000);
    expect(plan.createOptions.networkPolicy).toBe('allow-all');
    expect(plan.commands.map((command) => command.label)).toEqual([
      'runtime-readiness',
      'host-smoke-run',
    ]);
    expect(plan.files.map((file) => file.path)).toEqual([
      '.bitcode/pipeline-host/manifest.json',
      '.bitcode/pipeline-host/run-host-smoke.mjs',
      '.bitcode/pipeline-host/run-live-asset-pack-pipeline.ts',
    ]);
    expect(plan.artifactPaths).toEqual({
      evidence: '.bitcode/pipeline-host/evidence.json',
      telemetry: '.bitcode/pipeline-host/telemetry.jsonl',
    });
    expect(plan.manifest.expectedEvidenceTables).toContain('deliverable_pipeline_events');
  });

  it('carries deposit synthesis mode + steering into the manifest (#25)', () => {
    const plan = buildAssetPackSandboxHostPlan({
      ...baseOptions,
      mode: 'asset_pack_pipeline',
      source: {
        type: 'git',
        url: 'https://github.com/engineeredsoftware/ENGI.git',
        revision: baseOptions.sourceRevision.commit,
        depth: 1,
      },
      synthesizeMode: 'deposit',
      depositSteering: {
        obfuscations: 'hide internal names',
        forcedExclusions: ['secret/'],
        demandContext: ['auth'],
      },
    });
    expect(plan.manifest.synthesizeMode).toBe('deposit');
    expect(plan.manifest.depositSteering).toEqual({
      obfuscations: 'hide internal names',
      forcedExclusions: ['secret/'],
      demandContext: ['auth'],
    });
  });

  it('defaults synthesizeMode to read when unset', () => {
    expect(buildAssetPackSandboxHostPlan(baseOptions).manifest.synthesizeMode).toBe('read');
  });

  it('requires a repository source before planning the real pipeline mode', () => {
    expect(() =>
      buildAssetPackSandboxHostPlan({
        ...baseOptions,
        mode: 'asset_pack_pipeline',
      })
    ).toThrow(/requires a sandbox source/);
  });

  it('plans dependency install and live runner commands for real pipeline mode', () => {
    const plan = buildAssetPackSandboxHostPlan({
      ...baseOptions,
      mode: 'asset_pack_pipeline',
      source: {
        type: 'git',
        url: 'https://github.com/engineeredsoftware/ENGI.git',
        revision: baseOptions.sourceRevision.commit,
        depth: 1,
      },
    });

    expect(plan.createOptions.source).toEqual({
      type: 'git',
      url: 'https://github.com/engineeredsoftware/ENGI.git',
      revision: baseOptions.sourceRevision.commit,
      depth: 1,
    });
    expect(plan.commands.map((command) => command.label)).toEqual([
      'runtime-readiness',
      'package-manager-readiness',
      'workspace-install',
      'host-runtime-install',
      'asset-pack-pipeline-run',
    ]);
    expect(plan.commands.find((command) => command.label === 'package-manager-readiness')).toMatchObject({
      cmd: 'corepack',
      args: ['prepare', 'pnpm@10.33.0', '--activate'],
    });
    expect(plan.commands.find((command) => command.label === 'asset-pack-pipeline-run')).toMatchObject({
      cmd: 'sh',
      detached: true,
      exitCodePath: '.bitcode/pipeline-host/pipeline.exit-code',
      stdoutPath: '.bitcode/pipeline-host/pipeline.stdout.log',
      stderrPath: '.bitcode/pipeline-host/pipeline.stderr.log',
    });
  });

  it('can apply a local source overlay before installing and running the pipeline', () => {
    const plan = buildAssetPackSandboxHostPlan({
      ...baseOptions,
      mode: 'asset_pack_pipeline',
      source: {
        type: 'git',
        url: 'https://github.com/engineeredsoftware/ENGI.git',
        revision: baseOptions.sourceRevision.commit,
        depth: 1,
      },
      sourceOverlayPatch: 'diff --git a/example.txt b/example.txt\n',
    });

    expect(plan.sourceOverlay).toEqual({
      path: '.bitcode/pipeline-host/source-overlay.patch',
      patchRoot: '/vercel/sandbox',
      admissibility: 'qa-only-not-source-revision-evidence',
    });
    expect(plan.files.map((file) => file.path)).toContain(
      '.bitcode/pipeline-host/source-overlay.patch'
    );
    expect(plan.commands.map((command) => command.label)).toEqual([
      'runtime-readiness',
      'apply-source-overlay',
      'package-manager-readiness',
      'workspace-install',
      'host-runtime-install',
      'asset-pack-pipeline-run',
    ]);
    expect(plan.commands.find((command) => command.label === 'apply-source-overlay')).toMatchObject({
      cmd: 'git',
      args: ['apply', '--whitespace=nowarn', '.bitcode/pipeline-host/source-overlay.patch'],
    });
  });

  it('materializes manifest-bound deposit evidence roots when activity flags are present', () => {
    const plan = buildAssetPackSandboxHostPlan({
      ...baseOptions,
      deposit: {
        id: 'deposit-1',
        assetId: 'asset-repository-revision',
        hasWalletOrAttestationProof: true,
        hasAssetMeasurementEvidence: true,
      },
    });

    expect(plan.manifest.deposit).toMatchObject({
      id: 'deposit-1',
      assetId: 'asset-repository-revision',
      hasWalletOrAttestationProof: true,
      hasAssetMeasurementEvidence: true,
    });
    expect(plan.manifest.deposit.proofRoot).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(plan.manifest.deposit.measurementRoot).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(plan.manifest.deposit.reconciliationReadbackRoot).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('generates a syntactically valid live pipeline runner', () => {
    const plan = buildAssetPackSandboxHostPlan({
      ...baseOptions,
      mode: 'asset_pack_pipeline',
      assumeRepositoryPresent: true,
    });
    const liveRunner = plan.files.find((file) => file.path.endsWith('run-live-asset-pack-pipeline.ts'));
    const source = liveRunner?.content.toString('utf8') || '';
    const diagnostics = ts.transpileModule(liveRunner?.content.toString('utf8') || '', {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      reportDiagnostics: true,
    }).diagnostics || [];

    expect(diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)).toEqual([]);
    expect(source).toContain('pipeline-stream-event');
    expect(source).toContain('synthesizeReadNeedForPipelineInput');
    expect(source).toContain('buildAssetPackSourceSafePreview');
    expect(source).toContain('buildAssetPackPreviewBoundary');
    expect(source).toContain('persistAssetPackPreviewBoundary');
    expect(source).toContain('buildAssetPackDisclosureReview');
    expect(source).toContain('assertAssetPackDisclosureSourceSafe');
    expect(source).toContain('buildAssetPackSettlementRightsDeliveryBoundary');
    expect(source).toContain('persistAssetPackSettlementRightsDeliveryBoundary');
    expect(source).toContain('buildAssetPackSettlementUnlock');
    expect(source).toContain('applyAssetPackSettlementUnlockToPreview');
    expect(source).toContain('acceptedReadNeed: readNeed');
    expect(source).toContain('requireAcceptedReadNeed');
    expect(source).toContain('artifact-streaming-enabled');
    expect(source).toContain('execution: execution ? summarizeExecution(execution) : null');
    expect(source).toContain('PipelineHostTimeoutError');
    expect(source).toContain('settlementOwnershipBoundary');
    expect(source).toContain('normalizeBtcLedgerNetwork');
    expect(source).toContain('requestedNetwork');
    expect(source).toContain("normalized === 'testnet4'");
    expect(source).toContain("normalized === 'staging-testnet'");
    expect(source).toContain("btd_supply_state update readback missing after settlement write.");
    expect(source).toContain('depositor owns minted BTD range');
    expect(source).toContain('reader pays BTC fee');
    expect(source).toContain('verificationEvidence');
    expect(source).toContain('toolInputPresent');
    expect(source).toContain('toolOutputPresent');
    expect(source).toContain('toolErrorPresent');
    expect(source).toContain('promptTemplatePresent');
    expect(source).toContain('interpolatedPromptPresent');
    expect(source).toContain('rawModelResponsePresent');
    expect(source).toContain('parsedTypedOutputPresent');
    expect(source).toContain('inferenceAudit');
    expect(source).toContain('buildReadingPipelineObservabilityInventory');
    expect(source).toContain('resolveReadingPipelineTelemetryProjection');
    expect(source).toContain('summarizeReadingPipelineObservabilityCoverage');
    expect(source).toContain('readingPipelineTelemetry');
    expect(source).toContain('ptrrStepId');
    expect(source).toContain('thinkingsGenerationId');
    expect(source).toContain('outputSchema');
    expect(source).toContain('readingPipelineObservabilityCoverage');
    expect(source).toContain('Pipeline produced ');
    expect(source).toContain('sourceSafePreview,');
    expect(source).toContain('assetPackDisclosureReview,');
    expect(source).toContain("execution.store('asset-pack/preview', 'disclosureReview'");
    expect(source).toContain('protectedSourceUnlock');
    expect(source).toContain("execution.store('asset-pack/settlement', 'unlock'");
    expect(source).toContain("execution.store('asset-pack/preview', 'feeQuote'");
    expect(source).toContain('reconcileLedgerDatabaseProjection');
    expect(source).toContain('buildSupabaseStagingTestnetProjectionReadback');
    expect(source).toContain('objectStorageArtifacts');
    expect(source).toContain('buildProjectionTableReadbacks');
    expect(source).toContain('pipeline_evidence');
    expect(source).toContain('asset_pack_source_safe_preview');
    expect(source).toContain('staging-testnet-readback-');
    expect(source).toContain("execution.store('asset-pack/settlement', 'ledgerDatabaseReconciliation'");
    expect(source).toContain('assetPackSettlementRightsDeliveryBoundary');
    expect(source).toContain('assetPackSettlementReplayReceipt');
    expect(source).toContain('assetPackDeliveryUnlock');
    expect(source).toContain("execution.store('asset-pack/settlement', 'organizationAuthority'");
    expect(source).toContain('organizationAuthorityDecision');
    expect(source).toContain('organizationAuthorityRoot');
    expect(source).toContain('organizationAuthority,');
    expect(source).toContain('ledgerDatabaseReconciliation,');
    expect(source).toContain('repairActionCount');
    expect(source).toContain('ledgerSettlement,');
  });
});
