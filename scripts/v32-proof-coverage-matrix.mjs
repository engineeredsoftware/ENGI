export const V32_PROOF_COVERAGE_MATRIX_ARTIFACT = '.bitcode/v32-proof-coverage-matrix.json';

export const V32_REQUIRED_PROOF_SURFACE_IDS = Object.freeze([
  'terminal',
  'reading',
  'protocol-btd',
  'auxillaries',
  'mcp',
  'chatgpt-app',
  'api',
  'ledger',
  'database',
  'object-storage',
  'promotion',
  'protocol-demonstration'
]);

export const V32_SOURCE_SAFETY_CLASSES = Object.freeze([
  'source-safe-public',
  'source-safe-internal',
  'secret-presence-only',
  'protected-source-locked',
  'source-safe-generated-proof',
  'deferred-blocker'
]);

export const V32_COVERAGE_STATUSES = Object.freeze([
  'inherited-covered',
  'v32-expansion-required',
  'planned-gap'
]);

const coverageRows = Object.freeze([
  {
    surfaceId: 'terminal',
    promotedBehavior: 'URL-addressable product transactions, live execution streams, transaction detail cards, wallet/BTC posture, and source-safe operator readback.',
    owner: 'apps/uapi/app/terminal',
    fixture: 'apps/uapi/tests/terminalTransactionReadModel.test.ts; apps/uapi/tests/terminalPipelineHarnessClient.test.ts; apps/uapi/tests/pipelineExecutionLogHeader.test.tsx; apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts; apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts; apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    replayCommand: 'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalTransactionReadModel.test.ts tests/terminalPipelineHarnessClient.test.ts tests/pipelineExecutionLogHeader.test.tsx tests/terminalInterfaceIntegrationRegression.test.ts tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts --runInBand && pnpm run check:v32-interface-contract-regression-suites && pnpm run check:v32-browser-accessibility-responsive-visual-proof',
    expectedArtifact: '.bitcode/v32-browser-accessibility-responsive-visual-proof.json',
    sourceSafetyClass: 'source-safe-internal',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 6 and Gate 7',
    requiredContexts: ['TerminalTransaction', 'ProductTransactionReadModel', 'pipeline execution telemetry', 'operator source-safe projection'],
    failureModes: ['route-state-drift', 'stream-payload-shape-drift', 'unredacted-protected-source-in-detail-pane', 'operator-detail-overflow'],
    repairPosture: 'Gate 6 hardens transaction contract fixtures; Gate 7 proves browser/accessibility/responsive presentation.'
  },
  {
    surfaceId: 'reading',
    promotedBehavior: 'Read Request to reviewed Need, Finding Fits, source-safe AssetPack preview, settlement boundary, and paid PR delivery.',
    owner: 'packages/pipelines/asset-pack',
    fixture: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-contract.test.ts; packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-observability.test.ts; packages/asset-packs-pipelines/domain/src/__tests__/v32-reading-pipeline-proof-coverage.test.ts; packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts; packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts',
    replayCommand: 'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-pipeline-contract.test.ts src/__tests__/reading-pipeline-observability.test.ts src/__tests__/v32-reading-pipeline-proof-coverage.test.ts src/__tests__/read-need.test.ts src/__tests__/asset-pack-disclosure.test.ts --runInBand && pnpm run check:v32-reading-pipeline-proof-coverage',
    expectedArtifact: '.bitcode/v32-reading-pipeline-proof-coverage.json',
    sourceSafetyClass: 'protected-source-locked',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 4',
    requiredContexts: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis', 'PTRR agents', 'ThricifiedGenerations', 'prompt and tool registries'],
    failureModes: ['missing-thricified-generation-telemetry', 'no-worthy-fit-without-evidence', 'blocked-readiness-without-repair-path', 'pre-settlement-source-disclosure'],
    repairPosture: 'Gate 4 enumerates every pipeline phase, PTRR agent, PTRR step, ThricifiedGeneration, prompt, tool, typed output, telemetry row, and storage record.'
  },
  {
    surfaceId: 'protocol-btd',
    promotedBehavior: 'BTD ranges, read licenses, AssetPack mint/read/right-transfer receipts, BTC fee posture, and Protocol package canon helpers.',
    owner: 'packages/btd; scripts/specifying',
    fixture: 'packages/btd/__tests__/btc-fee-operation.test.ts; packages/btd/__tests__/btd.test.ts; packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts; scripts/specifying/test/specifying-package-boundary.test.js',
    replayCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts __tests__/btd.test.ts __tests__/v32-ledger-btd-settlement-failure-states.test.ts && pnpm run check:v32-ledger-btd-settlement-failure-states && pnpm --filter @bitcode/specifying test',
    expectedArtifact: '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json',
    sourceSafetyClass: 'source-safe-generated-proof',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 5',
    requiredContexts: ['BtdAssetPackMintReceipt', 'BtdReadReceipt', 'BtdRightsTransferReceipt', 'BtcFeeOperationPosture', 'SourceToSharesProof'],
    failureModes: ['fee-conservation-drift', 'range-conservation-drift', 'rights-transfer-mismatch', 'stale-canon-posture'],
    repairPosture: 'Gate 5 adds success, blocked, and repair-state coverage over fee, range, receipt, source-to-shares, right-transfer, and source-safe disclosure state.'
  },
  {
    surfaceId: 'auxillaries',
    promotedBehavior: 'Profile, account, provider readiness, interface admission, wallet/BTD pane, organization authority, diagnostics, recovery, and telemetry proof hooks.',
    owner: 'packages/api; packages/orm; apps/uapi/app/auxillaries',
    fixture: 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts; apps/uapi/tests/userDataRoute.test.ts; apps/uapi/tests/auxillariesWalletPane.test.tsx; apps/uapi/tests/auxillariesExternalsPane.test.tsx; apps/uapi/tests/auxillariesContent.access.test.tsx; apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts; apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    replayCommand: 'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/auxillaries-contract.test.ts --runInBand && pnpm --dir apps/uapi exec jest --runTestsByPath tests/userDataRoute.test.ts tests/auxillariesWalletPane.test.tsx tests/auxillariesExternalsPane.test.tsx tests/auxillariesContent.access.test.tsx tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts --runInBand && pnpm run check:v32-interface-contract-regression-suites && pnpm run check:v32-browser-accessibility-responsive-visual-proof',
    expectedArtifact: '.bitcode/v32-browser-accessibility-responsive-visual-proof.json',
    sourceSafetyClass: 'source-safe-internal',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 6 and Gate 7',
    requiredContexts: ['AuxillariesProfileState', 'AuxillariesConnectionReadiness', 'AuxillariesInterfaceAdmission', 'OrganizationPolicyAuthority', 'AuxillariesTelemetryProofHook'],
    failureModes: ['provider-readiness-drift', 'policy-denial-missing-reason', 'wallet-btd-projection-mismatch', 'recovery-run-without-before-after-roots'],
    repairPosture: 'Gate 6 turns inherited Auxillaries contracts into shared regression fixtures; Gate 7 expands browser/accessibility evidence.'
  },
  {
    surfaceId: 'mcp',
    promotedBehavior: 'MCP write admission, auth boundaries, pipeline tool contracts, prompt canon, and queued execution metadata.',
    owner: 'apps/mcp',
    fixture: 'apps/mcp/src/__tests__/unit/auth.test.ts; apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts; apps/mcp/src/__tests__/unit/prompt-asset-pack-canon.test.ts',
    replayCommand: 'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/auth.test.ts src/__tests__/unit/pipeline-ingress-contract.test.ts src/__tests__/unit/prompt-asset-pack-canon.test.ts --runInBand && pnpm run check:v32-interface-contract-regression-suites',
    expectedArtifact: '.bitcode/v32-interface-contract-regression-suite.json',
    sourceSafetyClass: 'source-safe-internal',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 6',
    requiredContexts: ['tool schema', 'write admission receipt', 'repository anchor', 'pipeline queue metadata'],
    failureModes: ['unauthorized-write-admitted', 'write-admission-metadata-missing', 'tool-schema-drift', 'prompt-canon-drift'],
    repairPosture: 'Gate 6 aligns MCP contract fixtures with API, product, ChatGPT App, and deferred interface blockers.'
  },
  {
    surfaceId: 'chatgpt-app',
    promotedBehavior: 'ChatGPT App tool surfaces, prompt documentation, interface integration seams, and source-safe tool responses.',
    owner: 'packages/chatgptapp',
    fixture: 'apps/chatgpt/src/__tests__/tools.test.ts; apps/chatgpt/src/__tests__/yapperFlow.test.ts',
    replayCommand: 'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts src/__tests__/yapperFlow.test.ts --runInBand && pnpm run check:v32-interface-contract-regression-suites',
    expectedArtifact: '.bitcode/v32-interface-contract-regression-suite.json',
    sourceSafetyClass: 'source-safe-internal',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 6',
    requiredContexts: ['tool descriptors', 'tool result schemas', 'prompt docs', 'interface admission'],
    failureModes: ['tool-schema-drift', 'unbounded-tool-response', 'missing-interface-blocker', 'prompt-doc-drift'],
    repairPosture: 'Gate 6 aligns ChatGPT App fixtures with shared interface contracts and source-safety classes.'
  },
  {
    surfaceId: 'api',
    promotedBehavior: 'UAPI and package API routes for Reading, pipeline harnesses, VCS, user data, Auxillaries, BTD, and transaction readback.',
    owner: 'apps/uapi/app/api; packages/api',
    fixture: 'apps/uapi/tests/api/readReviewRoute.test.ts; apps/uapi/tests/api/pipelineHostRoute.test.ts; apps/uapi/tests/api/vcsRoutes.test.ts; apps/uapi/tests/userDataRoute.test.ts; packages/api/src/routes/__tests__/btd-crypto.test.ts; apps/uapi/tests/api/conversationsRouteRead.test.ts',
    replayCommand: 'pnpm --dir apps/uapi exec jest --runTestsByPath tests/api/readReviewRoute.test.ts tests/api/pipelineHostRoute.test.ts tests/api/vcsRoutes.test.ts tests/userDataRoute.test.ts tests/api/conversationsRouteRead.test.ts --runInBand && pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand && pnpm run check:v32-interface-contract-regression-suites',
    expectedArtifact: '.bitcode/v32-interface-contract-regression-suite.json',
    sourceSafetyClass: 'source-safe-internal',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 6',
    requiredContexts: ['route schemas', 'auth/session posture', 'policy denial', 'source-safe JSON projection'],
    failureModes: ['route-schema-drift', 'auth-boundary-bypass', 'source-safety-class-missing', 'provider-error-without-repair-action'],
    repairPosture: 'Gate 6 converts inherited route tests into shared API/interface contract regressions.'
  },
  {
    surfaceId: 'ledger',
    promotedBehavior: 'BTC fee, BTD ownership, read-license, internal ledger anchors, BTD journal entries, and reconciliation readback.',
    owner: 'packages/btd; packages/pipeline-hosts; apps/uapi/app/terminal',
    fixture: 'apps/uapi/tests/terminalJournalReconciliation.test.ts; packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts; packages/btd/__tests__/btc-fee-operation.test.ts; packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts',
    replayCommand: 'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalJournalReconciliation.test.ts --runInBand && pnpm --filter @bitcode/pipeline-hosts exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-host-plan.test.ts --runInBand && pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts __tests__/v32-ledger-btd-settlement-failure-states.test.ts && pnpm run check:v32-ledger-btd-settlement-failure-states',
    expectedArtifact: '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json',
    sourceSafetyClass: 'source-safe-generated-proof',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 5',
    requiredContexts: ['BtcFeeQuote', 'BtdRightsTransferReceipt', 'BTD journal entry', 'ledger projection root', 'reconciliation state'],
    failureModes: ['ledger-database-drift', 'journal-entry-missing', 'settlement-conservation-drift', 'read-license-unbound'],
    repairPosture: 'Gate 5 adds failure-state rows and deterministic repair roots for ledger/database reconciliation.'
  },
  {
    surfaceId: 'database',
    promotedBehavior: 'Supabase/PostgreSQL projections for executions, events, pipeline runs, BTD registry, user/account state, and asset-pack evidence.',
    owner: 'packages/orm; supabase/migrations; packages/pipeline-hosts',
    fixture: 'packages/orm/src/__tests__/bitcode-execution-storage.test.ts; packages/orm/src/__tests__/execution-events.test.ts; packages/orm/src/__tests__/btd-registry.test.ts; packages/orm/src/__tests__/data-health.contract.test.ts; packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts; packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts',
    replayCommand: 'pnpm -C packages/orm test -- --runTestsByPath src/__tests__/bitcode-execution-storage.test.ts src/__tests__/execution-events.test.ts src/__tests__/btd-registry.test.ts src/__tests__/data-health.contract.test.ts --runInBand && pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/v32-ledger-btd-settlement-failure-states.test.ts __tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts && pnpm run check:v32-ledger-btd-settlement-failure-states && pnpm run check:v32-testnet-mainnet-readiness-rehearsal',
    expectedArtifact: '.bitcode/v32-testnet-mainnet-readiness-rehearsal.json',
    sourceSafetyClass: 'secret-presence-only',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 5 and Gate 8',
    requiredContexts: ['pipeline_runs', 'execution_events', 'asset_pack_evidence', 'btd_registry', 'data-health contract'],
    failureModes: ['rls-projection-denial-without-repair', 'schema-type-drift', 'service-secret-leak', 'telemetry-row-missing'],
    repairPosture: 'Gate 5 proves ledger/database drift repair; Gate 8 proves environment-lane readiness without printing credentials.'
  },
  {
    surfaceId: 'object-storage',
    promotedBehavior: 'Object-storage and artifact delivery posture for source-safe proof artifacts, protected AssetPack source, delivery receipts, and retrieval readback.',
    owner: 'packages/pipeline-hosts; packages/orm; provider storage adapters',
    fixture: 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts; packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts; protocol-demonstration/test/core.test.js',
    replayCommand: 'pnpm --filter @bitcode/pipeline-hosts exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-host-plan.test.ts --runInBand && pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/v32-ledger-btd-settlement-failure-states.test.ts __tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts && pnpm run check:v32-ledger-btd-settlement-failure-states && pnpm run check:v32-testnet-mainnet-readiness-rehearsal && npm --prefix protocol-demonstration test -- --test-name-pattern "storage"',
    expectedArtifact: '.bitcode/v32-testnet-mainnet-readiness-rehearsal.json',
    sourceSafetyClass: 'protected-source-locked',
    coverageStatus: 'planned-gap',
    plannedGate: 'Gate 5 and Gate 8',
    requiredContexts: ['storage publication receipt', 'storage retrieval receipt', 'protected AssetPack lock', 'delivery admission'],
    failureModes: ['artifact-missing-after-settlement', 'protected-source-upload-visible-before-payment', 'storage-provider-readback-failed', 'delivery-receipt-unbound'],
    blockers: ['A future storage-provider depth gate must replace source-safe readiness classification with live provider readback for every protected-source storage adapter.'],
    repairPosture: 'Gate 5 binds delivery receipts to paid settlement and encrypted protected-source storage; Gate 8 classifies provider connectivity by environment lane.'
  },
  {
    surfaceId: 'promotion',
    promotedBehavior: 'Gate PR quality, version promotion workflow, spec-family checks, canonical input checks, canon-posture drift checks, and generated proof appendix.',
    owner: '.github/workflows; scripts; scripts/specifying',
    fixture: 'scripts/check-bitcode-spec-family.mjs; scripts/check-bitcode-canonical-inputs.mjs; scripts/check-bitcode-canon-posture-drift.mjs; scripts/generate-bitcode-proven.mjs; scripts/generate-v32-promotion-proof-generation-hardening.mjs; scripts/generate-v32-promotion-readiness-report.mjs; scripts/check-v32-gate10-promotion-readiness.mjs; scripts/specifying/test/v32-promotion-proof-generation.test.js; .github/workflows/bitcode-gate-quality.yml; .github/workflows/v32-canon-promotion.yml',
    replayCommand: 'pnpm run check:v32-gate1 && pnpm run check:v32-gate2 && pnpm run check:v32-gate9 && pnpm run check:v32-gate10 && node scripts/check-bitcode-spec-family.mjs --version V32 --mode draft --current-target V31 && node scripts/check-bitcode-canonical-inputs.mjs --current-target V31',
    expectedArtifact: '.bitcode/v32-promotion-readiness-report.json',
    sourceSafetyClass: 'source-safe-generated-proof',
    coverageStatus: 'v32-expansion-required',
    plannedGate: 'Gate 9 and Gate 10',
    requiredContexts: ['spec family', 'canonical inputs', 'canon posture', 'gate-quality workflow', 'promotion workflow'],
    failureModes: ['stale-status-truth', 'missing-generated-artifact', 'workflow-branch-mismatch', 'unsafe-main-push'],
    repairPosture: 'Gate 9 hardens generated-proof diagnostics through .bitcode/v32-promotion-proof-generation-hardening.json; Gate 10 wires V32 promotion and post-promotion V33 draft posture.'
  },
  {
    surfaceId: 'protocol-demonstration',
    promotedBehavior: 'Standalone minimal Bitcode witness for local fit finding, proof matrices, generated canon, and commercial/demonstration boundary separation.',
    owner: 'protocol-demonstration',
    fixture: 'protocol-demonstration/test/v21-specifying.test.js; protocol-demonstration/test/v28-boundary-separation.test.js; protocol-demonstration/test/local-fit-finding.test.js; protocol-demonstration/test/proven-generator.test.js',
    replayCommand: 'npm --prefix protocol-demonstration test && npm --prefix protocol-demonstration run test:v28-mvp-qa',
    expectedArtifact: '.bitcode/v32-protocol-demonstration-proof-coverage.json',
    sourceSafetyClass: 'source-safe-public',
    coverageStatus: 'inherited-covered',
    plannedGate: 'Gate 3 and Gate 9',
    requiredContexts: ['standalone witness', 'local fit finding', 'generated proof appendix', 'boundary separation'],
    failureModes: ['commercial-import-from-demonstration', 'demonstration-import-from-commercial', 'stale-canon-pointer-expectation', 'non-deterministic-proof-output'],
    repairPosture: 'Gate 3 controls deterministic replay; Gate 9 keeps generated proof diagnostics debuggable.'
  }
]);

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    counts[row[key]] = (counts[row[key]] || 0) + 1;
    return counts;
  }, {});
}

export function buildV32ProofCoverageMatrix() {
  const rows = V32_REQUIRED_PROOF_SURFACE_IDS.map((surfaceId) => {
    const row = coverageRows.find((entry) => entry.surfaceId === surfaceId);
    if (!row) throw new Error(`Missing V32 proof coverage row for ${surfaceId}`);
    return {
      blockers: [],
      ...row
    };
  });

  const statusCounts = countBy(rows, 'coverageStatus');
  const sourceSafetyCounts = countBy(rows, 'sourceSafetyClass');
  const plannedGapRows = rows.filter((row) => row.coverageStatus === 'planned-gap').map((row) => row.surfaceId);

  return {
    artifactId: 'v32-proof-coverage-matrix',
    schemaId: 'bitcode.v32.proofCoverageMatrix.v1',
    version: 'V32',
    currentTarget: 'V31',
    sourceCommit: 'draft-gate-2-source-derived',
    command: 'pnpm run generate:v32-proof-coverage-matrix',
    generatedAt: '2026-05-22T00:00:00.000Z',
    verdict: 'draft-inventory-complete',
    inputs: [
      'specifications/BITCODE_SPEC.txt',
      'specifications/BITCODE_SPEC_V31.md',
      'specifications/BITCODE_SPEC_V31_PROVEN.md',
      'specifications/BITCODE_SPEC_V32.md',
      'specifications/BITCODE_SPEC_V32_DELTA.md',
      'specifications/BITCODE_SPEC_V32_NOTES.md',
      'specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
      'specifications/SPECIFICATIONS_ROADMAP.md',
      'package.json',
      '.github/workflows/bitcode-gate-quality.yml'
    ],
    blockers: [],
    requiredSurfaceIds: [...V32_REQUIRED_PROOF_SURFACE_IDS],
    sourceSafetyClasses: [...V32_SOURCE_SAFETY_CLASSES],
    coverageStatuses: [...V32_COVERAGE_STATUSES],
    coverageSummary: {
      surfaceCount: rows.length,
      requiredSurfaceCount: V32_REQUIRED_PROOF_SURFACE_IDS.length,
      statusCounts,
      sourceSafetyCounts,
      plannedGapRows
    },
    rows
  };
}

export function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map((entry) => sortJson(entry));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)])
  );
}
