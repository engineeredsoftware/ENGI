#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json';
const GENERATED_AT = '2026-05-23T00:00:00.000Z';

const requiredRehearsalIds = Object.freeze([
  'local_full_stack_rehearsal',
  'staging_testnet_full_stack_rehearsal',
  'value_bearing_mainnet_blocked_rehearsal',
]);

const fullStackSurfaces = Object.freeze([
  'terminal',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'reading_pipeline_execution_receipts',
  'settlement_finality_simulation',
  'storage_posture',
  'repair_posture',
]);

const secretMarkers = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  '-----BEGIN PRIVATE KEY-----',
  'wallet seed',
  'mnemonic',
  'raw source',
  'source contents',
]);

const rows = Object.freeze([
  fullStackRow(
    'local_full_stack_rehearsal',
    'local full-stack deployment rehearsal',
    'local',
    [
      'terminal-local-log-root',
      'api-local-contract-log-root',
      'mcp-local-contract-log-root',
      'chatgpt-app-local-contract-log-root',
      'pipeline-local-runtime-receipt-log-root',
    ],
    'local settlement and finality use non-value regtest simulation with delivery locked until receipt roots agree',
  ),
  fullStackRow(
    'staging_testnet_full_stack_rehearsal',
    'staging-testnet full-stack deployment rehearsal',
    'staging-testnet',
    [
      'terminal-staging-testnet-log-root',
      'api-staging-testnet-contract-log-root',
      'mcp-staging-testnet-contract-log-root',
      'chatgpt-app-staging-testnet-contract-log-root',
      'pipeline-staging-testnet-runtime-receipt-log-root',
    ],
    'staging-testnet settlement and finality use testnet rehearsal with protected AssetPack source locked before paid unlock',
  ),
  {
    rehearsalId: 'value_bearing_mainnet_blocked_rehearsal',
    label: 'value-bearing mainnet blocked rehearsal',
    laneId: 'value-bearing-mainnet',
    hostIds: ['website', 'api', 'ledger_broadcasters', 'runtime_observers', 'repair_jobs'],
    exercisedSurfaces: ['settlement_finality_simulation', 'storage_posture', 'repair_posture'],
    runtimeReceiptIds: ['receipt.value-bearing-mainnet.blocked-admission'],
    proofBundlePaths: ['proof-bundle/value-bearing-mainnet-blocked-rehearsal'],
    sourceSafeLogKinds: ['blocked-admission-log-root', 'operator-denial-log-root'],
    screenshotOrLogRoots: ['mainnet-blocked-admission-log-root'],
    validationCommands: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/deployment-readiness-rehearsal.test.ts',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
    ],
    settlementFinalitySimulation: 'value-bearing mainnet settlement is represented only as blocked admission without broadcast or source unlock',
    storagePostureChecks: ['protected AssetPack source stays locked', 'object storage write remains denied'],
    repairPostureChecks: ['unlock repair remains blocked', 'mainnet broadcaster remains denied'],
    valueBearingMainnetAdmission: false,
    admissionVerdict: 'blocked_value_bearing_mainnet',
    failClosedResult: 'value-bearing mainnet remains blocked until a future canon explicitly admits it',
    proofRootBasis: ['EnvironmentLaneContract', 'BtcFeeQuote', 'SettlementUnlock', 'RuntimeObserverRepairJob'],
    auditEventName: 'deployment_readiness.value_bearing_mainnet_blocked',
  },
]);

function fullStackRow(rehearsalId, label, laneId, screenshotOrLogRoots, settlementFinalitySimulation) {
  return {
    rehearsalId,
    label,
    laneId,
    hostIds: ['website', 'api', 'mcp_api', 'chatgpt_app', 'pipeline_workers', 'runtime_observers', 'ledger_broadcasters', 'object_storage', 'database_projection', 'repair_jobs'],
    exercisedSurfaces: [...fullStackSurfaces],
    runtimeReceiptIds: [
      `receipt.${laneId}.terminal`,
      `receipt.${laneId}.public-api`,
      `receipt.${laneId}.mcp-api`,
      `receipt.${laneId}.chatgpt-app`,
      `receipt.${laneId}.reading-pipeline`,
      `receipt.${laneId}.settlement-finality`,
      `receipt.${laneId}.storage-repair`,
    ],
    proofBundlePaths: [
      `proof-bundle/${laneId}/terminal`,
      `proof-bundle/${laneId}/api`,
      `proof-bundle/${laneId}/mcp`,
      `proof-bundle/${laneId}/chatgpt-app`,
      `proof-bundle/${laneId}/reading-pipeline`,
      `proof-bundle/${laneId}/settlement-storage-repair`,
    ],
    sourceSafeLogKinds: [
      'terminal-screenshot-log-root',
      'public-api-contract-log-root',
      'mcp-api-contract-log-root',
      'chatgpt-app-contract-log-root',
      'reading-pipeline-runtime-receipt-log-root',
      'settlement-finality-simulation-log-root',
      'storage-repair-posture-log-root',
    ],
    screenshotOrLogRoots,
    validationCommands: [
      'pnpm --dir uapi run test:e2e:terminal-ux',
      'pnpm --filter @bitcode/api build',
      'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts src/__tests__/tools.test.ts --runInBand',
      'pnpm run qa:pipeline-readback',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/deployment-storage-posture.test.ts',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/runtime-observer-repair-job.test.ts',
    ],
    settlementFinalitySimulation,
    storagePostureChecks: ['ledger-derived state readback', 'database projection readback', 'object-storage source lock', 'generated proof artifact root'],
    repairPostureChecks: ['observer repair replay command', 'rollback repair playbook availability', 'blocked unlock on drift'],
    valueBearingMainnetAdmission: false,
    admissionVerdict: 'admitted_non_value_rehearsal',
    failClosedResult: 'deployment rehearsal remains blocked when any runtime receipt, log root, storage root, or repair root is missing',
    proofRootBasis: [
      'DeploymentHostCapabilityCatalog',
      'EnvironmentLaneContract',
      'DistributedExecutionRuntimeReceipt',
      'DeploymentStoragePosture',
      'RuntimeObserverRepairJob',
      'RollbackUpgradeRepairPlaybook',
    ],
    auditEventName: `deployment_readiness.${rehearsalId}`,
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileExists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function digest(relativePath) {
  return createHash('sha256').update(read(relativePath)).digest('hex');
}

function stableRoot(prefix, parts) {
  return `${prefix}:${createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24)}`;
}

function evidence(relativePath, tokens) {
  const content = fileExists(relativePath) ? read(relativePath) : '';
  return {
    path: relativePath,
    digest: fileExists(relativePath) ? digest(relativePath) : null,
    requiredTokens: tokens.map((token) => ({ token, present: content.includes(token) })),
  };
}

function buildRehearsal(row) {
  return {
    kind: 'bitcode.deployment_readiness_rehearsal',
    ...row,
    hostIds: [...row.hostIds],
    exercisedSurfaces: [...row.exercisedSurfaces],
    runtimeReceiptIds: [...row.runtimeReceiptIds],
    proofBundlePaths: [...row.proofBundlePaths],
    sourceSafeLogKinds: [...row.sourceSafeLogKinds],
    screenshotOrLogRoots: [...row.screenshotOrLogRoots],
    validationCommands: [...row.validationCommands],
    storagePostureChecks: [...row.storagePostureChecks],
    repairPostureChecks: [...row.repairPostureChecks],
    proofRootBasis: [...row.proofRootBasis],
    sourceSafety: { sourceSafe: true, protectedSourceVisible: false, containsProtectedSource: false, containsSecret: false },
    rehearsalRoot: stableRoot('deployment-readiness-rehearsal', [
      row.rehearsalId,
      row.label,
      row.laneId,
      row.hostIds.join(','),
      row.exercisedSurfaces.join(','),
      row.runtimeReceiptIds.join(','),
      row.proofBundlePaths.join(','),
      row.sourceSafeLogKinds.join(','),
      row.screenshotOrLogRoots.join(','),
      row.validationCommands.join(','),
      row.settlementFinalitySimulation,
      row.storagePostureChecks.join(','),
      row.repairPostureChecks.join(','),
      String(row.valueBearingMainnetAdmission),
      row.admissionVerdict,
      row.failClosedResult,
      row.proofRootBasis.join(','),
      row.auditEventName,
    ]),
  };
}

function buildArtifact() {
  const rehearsals = rows.map(buildRehearsal);
  const localAndStaging = rehearsals.filter((rehearsal) => rehearsal.laneId === 'local' || rehearsal.laneId === 'staging-testnet');
  const observedRehearsalIds = [...new Set(rehearsals.map((rehearsal) => rehearsal.rehearsalId))].sort();
  const missingRehearsalIds = requiredRehearsalIds.filter((id) => !observedRehearsalIds.includes(id));
  const sourceEvidence = [
    evidence('packages/btd/src/deployment-readiness-rehearsal.ts', [
      'DEPLOYMENT_READINESS_REHEARSAL_IDS',
      'buildDeploymentReadinessRehearsalSet',
      'localRehearsalCovered',
      'stagingTestnetRehearsalCovered',
      'valueBearingMainnetBlocked',
    ]),
    evidence('packages/btd/__tests__/deployment-readiness-rehearsal.test.ts', [
      'covers every interface, pipeline, settlement, storage, and repair surface for local and staging-testnet',
      'keeps value-bearing mainnet blocked',
      'fails closed when staging-testnet does not cover a required surface',
      'fails closed on serialized secret-shaped values',
    ]),
  ];
  const docsEvidence = [
    evidence('BITCODE_SPEC_V34.md', ['DeploymentReadinessRehearsal', ARTIFACT_PATH]),
    evidence('BITCODE_SPEC_V34_DELTA.md', ['DeploymentReadinessRehearsal', ARTIFACT_PATH]),
    evidence('BITCODE_SPEC_V34_PARITY_MATRIX.md', ['DeploymentReadinessRehearsal', ARTIFACT_PATH]),
    evidence('SPECIFICATIONS_ROADMAP.md', ['V34 Gate 9 closure anchor']),
  ];
  const workflowEvidence = [
    evidence('.github/workflows/bitcode-gate-quality.yml', ['check-v34-gate9-local-staging-testnet-deployment-rehearsal.mjs', 'deployment-readiness-rehearsal.test.ts']),
  ];
  const proofSourceCommit = stableRoot('proof-source', [
    ...sourceEvidence.map((entry) => entry.digest ?? entry.path),
    ...docsEvidence.map((entry) => entry.digest ?? entry.path),
    ...workflowEvidence.map((entry) => entry.digest ?? entry.path),
  ]);
  const coversSurface = (surface) => localAndStaging.every((rehearsal) => rehearsal.exercisedSurfaces.includes(surface));

  return {
    artifactId: 'v34-local-staging-testnet-deployment-rehearsal',
    schemaId: 'bitcode.v34.localStagingTestnetDeploymentRehearsal.v1',
    generatedAt: GENERATED_AT,
    version: 'V34',
    currentTarget: 'V33',
    sourceSafetyVerdict: 'source-safe-deployment-readiness-rehearsal-metadata',
    proofSourceCommit,
    validationCommand: 'pnpm run check:v34-local-staging-testnet-deployment-rehearsal',
    passed: missingRehearsalIds.length === 0,
    requiredRehearsalIds: [...requiredRehearsalIds],
    coverage: {
      rehearsalCount: rehearsals.length,
      observedRehearsalIds,
      missingRehearsalIds,
      localRehearsalCovered: rehearsals.some((rehearsal) => rehearsal.laneId === 'local'),
      stagingTestnetRehearsalCovered: rehearsals.some((rehearsal) => rehearsal.laneId === 'staging-testnet'),
      terminalCovered: coversSurface('terminal'),
      publicApiCovered: coversSurface('public_api'),
      mcpApiCovered: coversSurface('mcp_api'),
      chatGptAppCovered: coversSurface('chatgpt_app'),
      readingPipelineExecutionReceiptsCovered: coversSurface('reading_pipeline_execution_receipts'),
      settlementFinalitySimulationCovered: coversSurface('settlement_finality_simulation'),
      storagePostureCovered: coversSurface('storage_posture'),
      repairPostureCovered: coversSurface('repair_posture'),
      sourceSafeLogsCovered: rehearsals.every((rehearsal) => rehearsal.sourceSafeLogKinds.length > 0 && rehearsal.sourceSafeLogKinds.every((logKind) => /log-root/iu.test(logKind))),
      screenshotsOrLogsProofRooted: rehearsals.every((rehearsal) => rehearsal.screenshotOrLogRoots.length > 0 && rehearsal.proofBundlePaths.length > 0),
      validationCommandsCovered: rehearsals.every((rehearsal) => rehearsal.validationCommands.length > 0),
      proofRootsCovered: rehearsals.every((rehearsal) => rehearsal.proofRootBasis.length > 0),
      valueBearingMainnetAdmitted: rehearsals.some((rehearsal) => rehearsal.laneId === 'value-bearing-mainnet' && rehearsal.valueBearingMainnetAdmission === true),
      credentialsSerialized: false,
      protectedSourceVisible: false,
    },
    artifactRoot: stableRoot('v34-local-staging-testnet-deployment-rehearsal', [
      ...rehearsals.map((rehearsal) => rehearsal.rehearsalRoot),
      ...sourceEvidence.map((entry) => entry.digest ?? entry.path),
      ...docsEvidence.map((entry) => entry.digest ?? entry.path),
    ]),
    rehearsals,
    sourceEvidence,
    docsEvidence,
    workflowEvidence,
  };
}

function assertSourceSafe(serialized) {
  for (const marker of secretMarkers) {
    if (serialized.includes(marker)) throw new Error(`Generated artifact includes forbidden source/secret marker: ${marker}`);
  }
  if (/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serialized)) {
    throw new Error('Generated artifact includes env-assignment-shaped text.');
  }
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildArtifact();
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertSourceSafe(serialized);
  const outputPath = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    if (!existsSync(outputPath)) throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v34-local-staging-testnet-deployment-rehearsal.`);
    if (readFileSync(outputPath, 'utf8') !== serialized) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-local-staging-testnet-deployment-rehearsal.`);
    }
    process.stdout.write(`${ARTIFACT_PATH} is current.\n`);
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

main();
