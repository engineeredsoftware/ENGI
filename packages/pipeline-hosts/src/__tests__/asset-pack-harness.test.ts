import { buildAssetPackSandboxHarness } from '../asset-pack-harness';
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

describe('asset-pack sandbox harness plan', () => {
  it('builds a host smoke plan that exports manifest and artifact paths', () => {
    const plan = buildAssetPackSandboxHarness(baseOptions);

    expect(plan.createOptions.runtime).toBe('node24');
    expect(plan.createOptions.timeout).toBe(45 * 60 * 1000);
    expect(plan.createOptions.networkPolicy).toBe('allow-all');
    expect(plan.commands.map((command) => command.label)).toEqual([
      'runtime-readiness',
      'host-smoke-harness-run',
    ]);
    expect(plan.files.map((file) => file.path)).toEqual([
      '.bitcode/pipeline-harness/manifest.json',
      '.bitcode/pipeline-harness/run-host-smoke.mjs',
      '.bitcode/pipeline-harness/run-live-asset-pack-pipeline.ts',
    ]);
    expect(plan.artifactPaths).toEqual({
      evidence: '.bitcode/pipeline-harness/evidence.json',
      telemetry: '.bitcode/pipeline-harness/telemetry.jsonl',
    });
    expect(plan.manifest.expectedEvidenceTables).toContain('deliverable_pipeline_events');
  });

  it('requires a repository source before planning the real pipeline mode', () => {
    expect(() =>
      buildAssetPackSandboxHarness({
        ...baseOptions,
        mode: 'asset_pack_pipeline',
      })
    ).toThrow(/requires a sandbox source/);
  });

  it('plans dependency install and live runner commands for real pipeline mode', () => {
    const plan = buildAssetPackSandboxHarness({
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
      'harness-runtime-install',
      'asset-pack-pipeline-run',
    ]);
    expect(plan.commands.find((command) => command.label === 'package-manager-readiness')).toMatchObject({
      cmd: 'corepack',
      args: ['prepare', 'pnpm@10.33.0', '--activate'],
    });
    expect(plan.commands.find((command) => command.label === 'asset-pack-pipeline-run')).toMatchObject({
      cmd: 'sh',
      detached: true,
      exitCodePath: '.bitcode/pipeline-harness/pipeline.exit-code',
      stdoutPath: '.bitcode/pipeline-harness/pipeline.stdout.log',
      stderrPath: '.bitcode/pipeline-harness/pipeline.stderr.log',
    });
  });

  it('can apply a local source overlay before installing and running the pipeline', () => {
    const plan = buildAssetPackSandboxHarness({
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
      path: '.bitcode/pipeline-harness/source-overlay.patch',
      patchRoot: '/vercel/sandbox',
      admissibility: 'qa-only-not-source-revision-evidence',
    });
    expect(plan.files.map((file) => file.path)).toContain(
      '.bitcode/pipeline-harness/source-overlay.patch'
    );
    expect(plan.commands.map((command) => command.label)).toEqual([
      'runtime-readiness',
      'apply-source-overlay',
      'package-manager-readiness',
      'workspace-install',
      'harness-runtime-install',
      'asset-pack-pipeline-run',
    ]);
    expect(plan.commands.find((command) => command.label === 'apply-source-overlay')).toMatchObject({
      cmd: 'git',
      args: ['apply', '--whitespace=nowarn', '.bitcode/pipeline-harness/source-overlay.patch'],
    });
  });

  it('materializes manifest-bound deposit evidence roots when activity flags are present', () => {
    const plan = buildAssetPackSandboxHarness({
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
    const plan = buildAssetPackSandboxHarness({
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
    expect(source).toContain('acceptedReadNeed: readNeed');
    expect(source).toContain('requireAcceptedReadNeed');
    expect(source).toContain('artifact-streaming-enabled');
    expect(source).toContain('execution: execution ? summarizeExecution(execution) : null');
    expect(source).toContain('PipelineHarnessTimeoutError');
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
    expect(source).toContain('Pipeline produced ');
    expect(source).toContain('ledgerSettlement,');
  });
});
