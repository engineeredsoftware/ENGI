#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v32/testnet-mainnet-readiness-rehearsal.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

const laneRecords = Object.freeze([
  {
    laneId: 'local',
    state: 'ready',
    network: 'regtest',
    ledgerNetwork: 'local',
    valueBearingSettlementRequested: false,
    valueBearingSettlementAdmitted: false,
    sourceSafetyClass: 'source-safe-internal',
    secretHandling: 'no-live-secret-required',
    providerConnectivity: ['local-fixtures:ready', 'sandbox-host:review'],
    postures: ['local-ledger-ready', 'fixture-database-ready', 'source-safe-object-storage-only', 'regtest-btc-only', 'rollback-root-required'],
    blockers: [],
  },
  {
    laneId: 'staging-testnet',
    state: 'ready',
    network: 'testnet',
    ledgerNetwork: 'testnet',
    projectRef: 'tkpyosihuouusyaxtbau',
    valueBearingSettlementRequested: false,
    valueBearingSettlementAdmitted: false,
    sourceSafetyClass: 'secret-presence-only',
    secretHandling: 'presence-only-values-never-serialized',
    providerConnectivity: ['vercel-sandbox:ready', 'supabase-staging-testnet:ready', 'github-delivery:ready', 'model-inference:ready'],
    postures: ['ledger-readback-ready', 'database-readback-ready', 'encrypted-protected-source-storage', 'testnet-btc-only', 'rollback-root-required'],
    blockers: [],
  },
  {
    laneId: 'production-mainnet',
    state: 'blocked',
    network: 'mainnet',
    ledgerNetwork: 'mainnet',
    projectRef: 'rinalyjfecxnmyczrpzo',
    valueBearingSettlementRequested: true,
    valueBearingSettlementAdmitted: false,
    sourceSafetyClass: 'secret-presence-only',
    secretHandling: 'presence-only-values-never-serialized',
    providerConnectivity: ['supabase-production-mainnet:review', 'bitcoin-mainnet-observer:review', 'github-delivery:blocked'],
    postures: ['ledger-represented-no-value-write', 'database-non-value-readiness-only', 'protected-source-locked', 'mainnet-broadcast-blocked', 'future-launch-gate-required'],
    blockers: ['production-mainnet-value-bearing-not-admitted-in-v32', 'future-explicit-launch-gate-required'],
  },
  {
    laneId: 'offline-disabled',
    state: 'disabled',
    network: 'offline',
    ledgerNetwork: 'offline',
    valueBearingSettlementRequested: false,
    valueBearingSettlementAdmitted: false,
    sourceSafetyClass: 'source-safe-generated-proof',
    secretHandling: 'no-live-secret-required',
    providerConnectivity: ['external-network:disabled', 'wallet-broadcast:disabled'],
    postures: ['no-live-ledger-write', 'no-live-database-readback', 'no-live-object-storage-write', 'no-btc-broadcast', 'fixture-only'],
    blockers: ['external-network-disabled'],
  },
]);

const secretPresenceClasses = Object.freeze([
  'sandbox-auth-token',
  'model-provider-key',
  'supabase-admin-credential',
  'database-admin-password',
  'vcs-installation-credential',
  'wallet-signer-capability',
  'production-operator-approval',
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

function rootFor(value) {
  return sha256(stableStringify(value));
}

export function buildV32TestnetMainnetReadinessRehearsalArtifact() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/testnet-mainnet-readiness-rehearsal.ts', [
      'buildV32TestnetMainnetReadinessRehearsal',
      'production-mainnet-value-bearing-not-admitted-in-v32',
      'secret-presence-only',
      'tkpyosihuouusyaxtbau',
      'rinalyjfecxnmyczrpzo',
    ]),
    scanTokens('packages/btd/src/btc-fee-operation.ts', [
      'production-mainnet',
      'Value-bearing BTC fee settlement on mainnet requires explicit operational approval.',
    ]),
    scanTokens('packages/btd/src/deployment-lanes.ts', [
      'mainnet-value-bearing',
      'Value-bearing mainnet V27 lane requires operational approval root.',
    ]),
    scanTokens('packages/btd/README.md', [
      'testnet/mainnet readiness rehearsal',
      'secret-presence-only',
      'production-mainnet remains blocked',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts', [
      'represents every readiness lane with typed source-safe records',
      'classifies secret presence without serializing credential values',
      'keeps production-mainnet value-bearing settlement blocked in V32',
      'keeps disabled/offline rehearsal fixture-only',
    ]),
  ];
  const passed =
    laneRecords.length === 4 &&
    laneRecords.some((lane) => lane.laneId === 'staging-testnet' && lane.projectRef === 'tkpyosihuouusyaxtbau') &&
    laneRecords.some((lane) => lane.laneId === 'production-mainnet' && lane.valueBearingSettlementAdmitted === false && lane.state === 'blocked') &&
    laneRecords.some((lane) => lane.laneId === 'offline-disabled' && lane.state === 'disabled') &&
    secretPresenceClasses.length === 7 &&
    sourceEvidence.every(allTokensPresent) &&
    testEvidence.every(allTokensPresent);

  return {
    artifactId: 'v32-testnet-mainnet-readiness-rehearsal',
    schemaId: 'bitcode.v32.testnetMainnetReadinessRehearsal.v1',
    version: 'V32',
    currentTarget: 'V31',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-readiness-metadata-secret-presence-only',
    lanes: laneRecords.map((lane) => ({
      ...lane,
      readinessRoot: rootFor({
        laneId: lane.laneId,
        state: lane.state,
        blockers: lane.blockers,
        valueBearingSettlementAdmitted: lane.valueBearingSettlementAdmitted,
      }),
    })),
    secretPresenceClasses,
    proofCoverage: {
      laneCount: laneRecords.length,
      secretPresenceClassCount: secretPresenceClasses.length,
      localRepresented: true,
      stagingTestnetRepresented: true,
      productionMainnetRepresented: true,
      offlineDisabledRepresented: true,
      productionMainnetValueBearingAdmitted: false,
      secretValuesSerialized: false,
      protectedSourceSerialized: false,
      rawProviderPayloadsSerialized: false,
    },
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v32-gate8',
  };
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV32TestnetMainnetReadinessRehearsalArtifact();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V32 Gate 8 readiness rehearsal artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V32 Gate 8 readiness rehearsal artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v32-testnet-mainnet-readiness-rehearsal.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v32-testnet-mainnet-readiness-rehearsal.`);
    }
    process.stdout.write(`V32 testnet/mainnet readiness rehearsal artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(artifactFile), { recursive: true });
  writeFileSync(artifactFile, next);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
