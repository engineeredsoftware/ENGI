#!/usr/bin/env node

import crypto from 'node:crypto';
import {
  V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS,
  buildV45SourceSafeEndToEndRehearsal,
} from '../scripts/specifying/src/canonical/v45-source-safe-e2e-rehearsal.js';

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function parseArgs(argv) {
  const args = {
    lane: 'local-deterministic',
    dryRun: true,
    json: false,
    missingEvidence: null,
    contradictoryEvidence: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--lane') args.lane = argv[++index];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--execute') args.dryRun = false;
    else if (arg === '--json') args.json = true;
    else if (arg === '--missing-evidence') args.missingEvidence = argv[++index];
    else if (arg === '--contradictory-evidence') args.contradictoryEvidence = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/rehearse-v45-source-safe-e2e.mjs [--lane <lane>] [--dry-run] [--execute] [--json]',
      '',
      'Emits a source-safe V45 end-to-end rehearsal operator receipt. Live execution requires BITCODE_V45_REHEARSAL_EXECUTE=1.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function envPresence(name) {
  return { name, present: Boolean(process.env[name]) };
}

function requiredEnvNames(lane) {
  if (lane !== 'staging-testnet-credentialed') {
    return ['BITCODE_V45_REHEARSAL_EXECUTE'];
  }
  return [
    'BITCODE_V45_REHEARSAL_EXECUTE',
    'BITCODE_ASSET_PACK_REAL_INFERENCE',
    'BITCODE_PIPELINE_STREAM_TO_DATABASE',
    'BITCODE_ENABLE_PIPELINE_HARNESS_API',
    'OPENAI_API_KEY',
    'VERCEL_OIDC_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
}

function buildOverrides(args) {
  const overrides = {};
  if (args.missingEvidence) overrides[args.missingEvidence] = { present: false };
  if (args.contradictoryEvidence) {
    overrides[args.contradictoryEvidence] = {
      ...(overrides[args.contradictoryEvidence] || {}),
      contradictory: true,
    };
  }
  return overrides;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS.includes(args.lane)) {
    throw new Error(`Unknown V45 rehearsal lane ${args.lane}`);
  }

  const liveExecutionRequested = !args.dryRun;
  const liveExecutionAdmitted = liveExecutionRequested && process.env.BITCODE_V45_REHEARSAL_EXECUTE === '1';
  const evidenceOverrides = buildOverrides(args);
  const artifact = buildV45SourceSafeEndToEndRehearsal({ evidenceOverrides });
  const requiredEnvironment = requiredEnvNames(args.lane).map(envPresence);
  const ready = args.dryRun
    ? artifact.rehearsalStatus === 'completed_source_safe'
    : liveExecutionAdmitted &&
      artifact.rehearsalStatus === 'completed_source_safe' &&
      requiredEnvironment.every((entry) => entry.present);

  const receipt = {
    schema: 'bitcode.v45.sourceSafeEndToEndRehearsal.operatorReceipt',
    version: 'V45',
    currentTarget: 'V44',
    laneId: args.lane,
    dryRun: args.dryRun,
    liveExecutionOptInRequired: true,
    liveExecutionAdmitted,
    ready,
    stages: [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS],
    evidenceClassIds: [...artifact.evidenceClassIds],
    rehearsalStatus: artifact.rehearsalStatus,
    repairCases: artifact.repairCases.map((repairCase) => ({
      repairCaseId: repairCase.repairCaseId,
      repairState: repairCase.repairState,
      repairRoot: repairCase.repairRoot,
    })),
    requiredEnvironment,
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      secretValueSerialized: false,
      protectedSourcePayloadSerialized: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      liveRehearsalLogPayloadSerialized: false,
      valueBearingMainnetAdmitted: false,
    },
    roots: {
      artifactRoot: artifact.artifactRoot,
      telemetrySummaryRoot: `sha256:${digest(`${args.lane}:telemetry:${artifact.artifactRoot}`)}`,
      ledgerReadbackRoot: `sha256:${digest(`${args.lane}:ledger:${artifact.artifactRoot}`)}`,
      databaseReadbackRoot: `sha256:${digest(`${args.lane}:database:${artifact.artifactRoot}`)}`,
      storageReadbackRoot: `sha256:${digest(`${args.lane}:storage:${artifact.artifactRoot}`)}`,
      browserReceiptRoot: `sha256:${digest(`${args.lane}:browser:${artifact.artifactRoot}`)}`,
      repairRoot: `sha256:${digest(`${args.lane}:repair:${artifact.artifactRoot}:${artifact.rehearsalStatus}`)}`,
    },
  };

  const serialized = JSON.stringify(receipt, null, 2);
  if (args.json) process.stdout.write(`${serialized}\n`);
  else {
    process.stdout.write(`V45 source-safe end-to-end rehearsal ${args.lane}: ${receipt.rehearsalStatus}\n`);
    process.stdout.write(`${serialized}\n`);
  }

  if (!receipt.ready && !args.dryRun) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
