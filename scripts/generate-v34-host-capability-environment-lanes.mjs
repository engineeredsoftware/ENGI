#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const HOST_ARTIFACT_PATH = '.bitcode/v34-deployment-host-capability-catalog.json';
const LANE_ARTIFACT_PATH = '.bitcode/v34-environment-lane-contracts.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

const requiredHostIds = Object.freeze([
  'website',
  'api',
  'mcp_api',
  'chatgpt_app',
  'pipeline_workers',
  'runtime_observers',
  'ledger_broadcasters',
  'proof_services',
  'repair_jobs',
  'object_storage',
  'database_projection',
  'ledger_projection',
]);

const requiredLaneIds = Object.freeze([
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
  'value-bearing-mainnet',
]);

const hostRows = Object.freeze([
  {
    hostId: 'website',
    runtimeSurface: 'website',
    ownerPackage: 'uapi',
    runtimeCarrier: 'vercel-nextjs-website',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: [HOST_ARTIFACT_PATH],
    validationCommand:
      'pnpm --dir uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
    supportedLaneIds: ['local', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.website',
  },
  {
    hostId: 'api',
    runtimeSurface: 'api',
    ownerPackage: 'packages/api',
    runtimeCarrier: 'vercel-node-api',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: [LANE_ARTIFACT_PATH],
    validationCommand:
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
    supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.api',
  },
  {
    hostId: 'mcp_api',
    runtimeSurface: 'mcp_api',
    ownerPackage: 'packages/generic-mcps/bitcode',
    runtimeCarrier: 'mcp-server-process',
    outboundNetworkPosture: 'outbound_restricted',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v33-mcp-api-tool-contracts.json'],
    validationCommand:
      'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
    supportedLaneIds: ['local', 'staging-testnet', 'public-testnet'],
    telemetryProofHookId: 'deployment.telemetry.mcp-api',
  },
  {
    hostId: 'chatgpt_app',
    runtimeSurface: 'chatgpt_app',
    ownerPackage: 'packages/chatgptapp',
    runtimeCarrier: 'chatgpt-action-service',
    outboundNetworkPosture: 'outbound_restricted',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v33-chatgpt-app-action-contracts.json'],
    validationCommand:
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
    supportedLaneIds: ['local', 'staging-testnet', 'public-testnet'],
    telemetryProofHookId: 'deployment.telemetry.chatgpt-app',
  },
  {
    hostId: 'pipeline_workers',
    runtimeSurface: 'worker',
    ownerPackage: 'packages/pipeline-hosts',
    runtimeCarrier: 'vercel-sandbox-worker',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v34-distributed-execution-runtime-receipts.json'],
    validationCommand: 'pnpm --filter @bitcode/pipeline-hosts typecheck',
    supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.pipeline-worker',
  },
  {
    hostId: 'runtime_observers',
    runtimeSurface: 'observer',
    ownerPackage: 'packages/btd',
    runtimeCarrier: 'scheduled-observer-job',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json'],
    validationCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts',
    supportedLaneIds: ['regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.runtime-observer',
  },
  {
    hostId: 'ledger_broadcasters',
    runtimeSurface: 'broadcaster',
    ownerPackage: 'packages/btd',
    runtimeCarrier: 'ledger-broadcaster-job',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json'],
    validationCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
    supportedLaneIds: ['regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.ledger-broadcaster',
  },
  {
    hostId: 'proof_services',
    runtimeSurface: 'proof_service',
    ownerPackage: 'packages/protocol',
    runtimeCarrier: 'proof-generation-job',
    outboundNetworkPosture: 'none',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v34-promotion-readiness-report.json'],
    validationCommand: 'pnpm --filter @bitcode/protocol test',
    supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.proof-service',
  },
  {
    hostId: 'repair_jobs',
    runtimeSurface: 'repair_job',
    ownerPackage: 'packages/btd',
    runtimeCarrier: 'operator-repair-command',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_non_value_lanes',
    proofOutputPaths: ['.bitcode/v34-rollback-upgrade-data-repair-playbooks.json'],
    validationCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
    supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.repair-job',
  },
  {
    hostId: 'object_storage',
    runtimeSurface: 'object_storage',
    ownerPackage: 'packages/pipeline-hosts',
    runtimeCarrier: 'durable-object-storage',
    outboundNetworkPosture: 'egress_locked',
    admissionStatus: 'admitted_projection_carrier',
    proofOutputPaths: ['.bitcode/v34-deployment-storage-posture.json'],
    validationCommand: 'pnpm --filter @bitcode/pipeline-hosts typecheck',
    supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.object-storage',
  },
  {
    hostId: 'database_projection',
    runtimeSurface: 'database_projection',
    ownerPackage: 'packages/supabase',
    runtimeCarrier: 'supabase-postgres-projection',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_projection_carrier',
    proofOutputPaths: ['.bitcode/v34-deployment-storage-posture.json'],
    validationCommand: 'pnpm --filter @bitcode/btd typecheck',
    supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.database-projection',
  },
  {
    hostId: 'ledger_projection',
    runtimeSurface: 'ledger_projection',
    ownerPackage: 'packages/btd',
    runtimeCarrier: 'ledger-projection-store',
    outboundNetworkPosture: 'provider_bound',
    admissionStatus: 'admitted_projection_carrier',
    proofOutputPaths: ['.bitcode/v34-deployment-storage-posture.json'],
    validationCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
    supportedLaneIds: ['regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    telemetryProofHookId: 'deployment.telemetry.ledger-projection',
  },
]);

const laneRows = Object.freeze([
  {
    laneId: 'local',
    bitcoinNetworkPosture: 'none',
    supabaseProjectPosture: 'local_process',
    vercelProjectPosture: 'local_process',
    valueBearingAdmission: 'not_value_bearing',
    walletPolicy: 'no_wallet',
    admittedHostIds: ['website', 'api', 'mcp_api', 'chatgpt_app', 'pipeline_workers', 'proof_services', 'repair_jobs', 'object_storage', 'database_projection'],
    telemetryProofHookId: 'deployment.telemetry.lane.local',
  },
  {
    laneId: 'regtest',
    bitcoinNetworkPosture: 'regtest',
    supabaseProjectPosture: 'local_project',
    vercelProjectPosture: 'local_project',
    valueBearingAdmission: 'not_value_bearing',
    walletPolicy: 'regtest_wallet',
    admittedHostIds: ['api', 'pipeline_workers', 'runtime_observers', 'ledger_broadcasters', 'proof_services', 'repair_jobs', 'object_storage', 'database_projection', 'ledger_projection'],
    telemetryProofHookId: 'deployment.telemetry.lane.regtest',
  },
  {
    laneId: 'signet',
    bitcoinNetworkPosture: 'signet',
    supabaseProjectPosture: 'staging_testnet_project',
    vercelProjectPosture: 'staging_testnet_project',
    valueBearingAdmission: 'not_value_bearing',
    walletPolicy: 'signet_wallet',
    admittedHostIds: ['api', 'pipeline_workers', 'runtime_observers', 'ledger_broadcasters', 'proof_services', 'repair_jobs', 'object_storage', 'database_projection', 'ledger_projection'],
    telemetryProofHookId: 'deployment.telemetry.lane.signet',
  },
  {
    laneId: 'staging-testnet',
    bitcoinNetworkPosture: 'signet',
    supabaseProjectPosture: 'staging_testnet_project',
    vercelProjectPosture: 'staging_testnet_project',
    valueBearingAdmission: 'not_value_bearing',
    walletPolicy: 'signet_wallet',
    admittedHostIds: [...requiredHostIds],
    telemetryProofHookId: 'deployment.telemetry.lane.staging-testnet',
  },
  {
    laneId: 'public-testnet',
    bitcoinNetworkPosture: 'testnet',
    supabaseProjectPosture: 'public_testnet_project',
    vercelProjectPosture: 'public_testnet_project',
    valueBearingAdmission: 'not_value_bearing',
    walletPolicy: 'testnet_wallet',
    admittedHostIds: [...requiredHostIds],
    telemetryProofHookId: 'deployment.telemetry.lane.public-testnet',
  },
  {
    laneId: 'mainnet-ready-dry-run',
    bitcoinNetworkPosture: 'mainnet',
    supabaseProjectPosture: 'production_project_dry_run',
    vercelProjectPosture: 'production_project_dry_run',
    valueBearingAdmission: 'dry_run_only',
    walletPolicy: 'mainnet_watch_only',
    admittedHostIds: requiredHostIds.filter((hostId) => hostId !== 'ledger_broadcasters'),
    telemetryProofHookId: 'deployment.telemetry.lane.mainnet-ready-dry-run',
  },
  {
    laneId: 'value-bearing-mainnet',
    bitcoinNetworkPosture: 'mainnet',
    supabaseProjectPosture: 'production_project_blocked',
    vercelProjectPosture: 'production_project_blocked',
    valueBearingAdmission: 'blocked_future_canon_required',
    walletPolicy: 'mainnet_value_blocked',
    admittedHostIds: [],
    telemetryProofHookId: 'deployment.telemetry.lane.value-bearing-mainnet',
  },
]);

const sourceFiles = Object.freeze([
  'packages/btd/src/deployment-host-capability-catalog.ts',
  'packages/btd/src/index.ts',
  'BITCODE_SPEC_V34.md',
  'BITCODE_SPEC_V34_DELTA.md',
  'BITCODE_SPEC_V34_PARITY_MATRIX.md',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/deployment-host-capability-catalog.test.ts',
  'scripts/check-v34-gate2-host-capability-environment-lanes.mjs',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function stableRoot(prefix, parts) {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function scanTokens(relativePath, tokens) {
  const text = read(relativePath);
  return {
    relativePath,
    digest: sha256(text),
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

function withHostRowRoots(rows) {
  return rows.map((row) => ({
    ...row,
    rowRoot: stableRoot('v34-deployment-host-capability-row', [
      row.hostId,
      row.runtimeSurface,
      row.ownerPackage,
      row.runtimeCarrier,
      row.outboundNetworkPosture,
      row.admissionStatus,
      row.proofOutputPaths.join(','),
      row.validationCommand,
      row.supportedLaneIds.join(','),
      row.telemetryProofHookId,
    ]),
  }));
}

function withLaneRoots(rows) {
  return rows.map((row) => ({
    ...row,
    laneRoot: stableRoot('v34-environment-lane-contract', [
      row.laneId,
      row.bitcoinNetworkPosture,
      row.supabaseProjectPosture,
      row.vercelProjectPosture,
      row.valueBearingAdmission,
      row.walletPolicy,
      row.admittedHostIds.join(','),
      row.telemetryProofHookId,
    ]),
  }));
}

export function buildV34DeploymentHostCapabilityCatalogArtifact() {
  const rows = withHostRowRoots(hostRows);
  const observedHostIds = rows.map((row) => row.hostId);
  const missingHostIds = requiredHostIds.filter((hostId) => !observedHostIds.includes(hostId));
  const sourceEvidence = [
    scanTokens('packages/btd/src/deployment-host-capability-catalog.ts', [
      'DeploymentHostCapabilityCatalog',
      'EnvironmentLaneContract',
      'value-bearing-mainnet',
      'blocked_future_canon_required',
      'pipeline_workers',
      'object_storage',
      'database_projection',
      'ledger_projection',
    ]),
    scanTokens('packages/btd/src/index.ts', ['deployment-host-capability-catalog']),
    scanTokens('BITCODE_SPEC_V34.md', [
      HOST_ARTIFACT_PATH,
      LANE_ARTIFACT_PATH,
      'DeploymentHostCapabilityCatalog',
      'EnvironmentLaneContract',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/deployment-host-capability-catalog.test.ts', [
      'catalogs website, API, MCP API, ChatGPT App, workers, observers, broadcasters, proof services, repair jobs, and storage projections',
      'keeps value-bearing mainnet visible as blocked and without admitted runtime hosts',
      'fails closed when a required deployment host row is missing',
      'fails closed on secret-shaped or non-disclosable source catalog text',
    ]),
    scanTokens('scripts/check-v34-gate2-host-capability-environment-lanes.mjs', [
      'check:v34-host-capability-environment-lanes',
      'deployment-host-capability-catalog.test.ts',
      'Host Capability And Environment Lane Catalog',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const passed =
    missingHostIds.length === 0 &&
    rows.length === 12 &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v34-deployment-host-capability-catalog',
    schemaId: 'bitcode.v34.deploymentHostCapabilityCatalog.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-deployment-host-capability-metadata',
    requiredHostIds,
    catalogRoot: stableRoot('v34-deployment-host-capability-catalog', rows.map((row) => row.rowRoot)),
    rows,
    coverage: {
      observedHostIds,
      missingHostIds,
      hostCount: rows.length,
      websiteRepresented: observedHostIds.includes('website'),
      apiRepresented: observedHostIds.includes('api'),
      objectStorageRepresented: observedHostIds.includes('object_storage'),
      databaseProjectionRepresented: observedHostIds.includes('database_projection'),
      ledgerProjectionRepresented: observedHostIds.includes('ledger_projection'),
      valueBearingMainnetHidden: false,
      protectedSourceVisible: false,
      credentialsSerialized: false,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v34-gate2',
  };
}

export function buildV34EnvironmentLaneContractsArtifact() {
  const lanes = withLaneRoots(laneRows);
  const observedLaneIds = lanes.map((lane) => lane.laneId);
  const missingLaneIds = requiredLaneIds.filter((laneId) => !observedLaneIds.includes(laneId));
  const valueBearingMainnet = lanes.find((lane) => lane.laneId === 'value-bearing-mainnet');
  const sourceEvidence = [
    scanTokens('packages/btd/src/deployment-host-capability-catalog.ts', [
      'ENVIRONMENT_LANE_CONTRACT_IDS',
      'mainnet-ready-dry-run',
      'value-bearing-mainnet',
      'blocked_future_canon_required',
      'buildEnvironmentLaneContracts',
    ]),
    scanTokens('BITCODE_SPEC_V34_DELTA.md', [
      'local, regtest, signet, staging-testnet, public testnet, mainnet-ready dry run, and value-bearing mainnet lanes are represented',
      LANE_ARTIFACT_PATH,
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/deployment-host-capability-catalog.test.ts', [
      'catalogs local, regtest, signet, staging-testnet, public testnet, mainnet dry run, and blocked value-bearing mainnet lanes',
      'fails closed when value-bearing mainnet admits hosts or stops being blocked',
      'fails closed when mainnet-ready dry run is made value-bearing',
    ]),
    scanTokens('scripts/check-v34-gate2-host-capability-environment-lanes.mjs', [
      'value-bearing-mainnet',
      'blocked_future_canon_required',
      'environment-lane-contracts',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const passed =
    missingLaneIds.length === 0 &&
    lanes.length === 7 &&
    valueBearingMainnet?.valueBearingAdmission === 'blocked_future_canon_required' &&
    valueBearingMainnet.admittedHostIds.length === 0 &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v34-environment-lane-contracts',
    schemaId: 'bitcode.v34.environmentLaneContracts.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-environment-lane-contract-metadata',
    requiredLaneIds,
    laneContractRoot: stableRoot('v34-environment-lane-contracts', lanes.map((lane) => lane.laneRoot)),
    lanes,
    coverage: {
      observedLaneIds,
      missingLaneIds,
      laneCount: lanes.length,
      valueBearingMainnetAdmission: valueBearingMainnet?.valueBearingAdmission ?? null,
      valueBearingMainnetAdmittedHostCount: valueBearingMainnet?.admittedHostIds.length ?? null,
      mainnetReadyDryRunAdmission:
        lanes.find((lane) => lane.laneId === 'mainnet-ready-dry-run')?.valueBearingAdmission ?? null,
      valueBearingMainnetHidden: false,
      protectedSourceVisible: false,
      credentialsSerialized: false,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v34-gate2',
  };
}

function assertSafeArtifact(artifact, artifactPath) {
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error(`${artifactPath} contains a secret-shaped marker.`);
  }
  if (!artifact.passed) {
    throw new Error(`${artifactPath} source or test evidence is incomplete.`);
  }

  return serialized;
}

function writeArtifact(artifact, artifactPath) {
  const serialized = assertSafeArtifact(artifact, artifactPath);
  mkdirSync(path.dirname(path.join(repoRoot, artifactPath)), { recursive: true });
  writeFileSync(path.join(repoRoot, artifactPath), serialized);
  return serialized;
}

function checkArtifact(artifact, artifactPath) {
  const next = assertSafeArtifact(artifact, artifactPath);
  const artifactFile = path.join(repoRoot, artifactPath);
  if (!existsSync(artifactFile)) {
    throw new Error(`${artifactPath} is missing. Run pnpm run generate:v34-host-capability-environment-lanes.`);
  }
  const current = readFileSync(artifactFile, 'utf8');
  if (current !== next) {
    throw new Error(`${artifactPath} is stale. Run pnpm run generate:v34-host-capability-environment-lanes.`);
  }
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const hostArtifact = buildV34DeploymentHostCapabilityCatalogArtifact();
  const laneArtifact = buildV34EnvironmentLaneContractsArtifact();

  if (mode === 'check') {
    checkArtifact(hostArtifact, HOST_ARTIFACT_PATH);
    checkArtifact(laneArtifact, LANE_ARTIFACT_PATH);
    process.stdout.write(`V34 host capability and environment lane artifacts ok ${HOST_ARTIFACT_PATH} ${LANE_ARTIFACT_PATH}\n`);
    return;
  }

  writeArtifact(hostArtifact, HOST_ARTIFACT_PATH);
  writeArtifact(laneArtifact, LANE_ARTIFACT_PATH);
  process.stdout.write(`Wrote ${HOST_ARTIFACT_PATH}\nWrote ${LANE_ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
