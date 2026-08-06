#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const V42_REHEARSAL_LANES = ['local', 'staging-testnet'];

const DEFAULT_RECEIPT_DIR = '.proofs/pipeline-host-runs/v42-mvp-rehearsal-receipts';
const STAGING_PROJECT_REF = 'tkpyosihuouusyaxtbau';
const STAGING_REST_HOST = 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/';

const SOURCE_SAFETY = Object.freeze({
  sourceSafeMetadataOnly: true,
  protectedSourcePayloadSerialized: false,
  rawProtectedPromptVisible: false,
  rawInterpolatedPromptVisible: false,
  rawProviderResponseVisible: false,
  unpaidAssetPackSourceVisible: false,
  credentialsSerialized: false,
  walletPrivateMaterialVisible: false,
  privateSettlementPayloadVisible: false,
  liveRehearsalLogPayloadSerialized: false,
  valueBearingMainnetAdmitted: false,
  secretValueSerialized: false,
});

const ENVIRONMENT_FAMILIES = Object.freeze({
  sandboxAuth: {
    familyId: 'sandbox-auth',
    required: true,
    acceptedKeyNames: ['VERCEL_OIDC_TOKEN', 'VERCEL_TOKEN'],
    posture: 'vercel-oidc-preferred-access-token-fallback',
  },
  sandboxOptIn: {
    familyId: 'sandbox-live-opt-in',
    required: true,
    acceptedKeyNames: ['BITCODE_RUN_VERCEL_SANDBOX_HARNESS'],
    requiredLiteralValue: '1',
    posture: 'explicit-live-sandbox-opt-in',
  },
  harnessApi: {
    familyId: 'pipeline-host-api-enabled',
    required: true,
    acceptedKeyNames: ['BITCODE_ENABLE_PIPELINE_HARNESS_API'],
    requiredLiteralValue: '1',
    posture: 'local-and-staging-harness-api-enabled',
  },
  llmProvider: {
    familyId: 'llm-provider-key',
    required: true,
    acceptedKeyNames: ['OPENAI_API_KEY'],
    posture: 'real-inference-provider-credential',
  },
  supabaseUrl: {
    familyId: 'supabase-rest-url',
    required: true,
    acceptedKeyNames: ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'],
    requiredHost: `${STAGING_PROJECT_REF}.supabase.co`,
    posture: 'staging-testnet-rest-host-bound',
  },
  supabasePublic: {
    familyId: 'supabase-public-key',
    required: true,
    acceptedKeyNames: [
      'SUPABASE_ANON_KEY',
      'SUPABASE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ],
    posture: 'staging-testnet-public-readback-key',
  },
  supabaseAdmin: {
    familyId: 'supabase-admin-key',
    required: true,
    acceptedKeyNames: ['SUPABASE_SECRET_KEY', 'SUPABASE_ADMIN_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    posture: 'staging-testnet-admin-readback-key',
  },
  databaseStreaming: {
    familyId: 'pipeline-database-streaming',
    required: true,
    acceptedKeyNames: ['BITCODE_PIPELINE_STREAM_TO_DATABASE'],
    requiredLiteralValue: '1',
    posture: 'pipeline-events-persist-to-staging-database',
  },
  realInference: {
    familyId: 'assetpack-real-inference',
    required: true,
    acceptedKeyNames: ['BITCODE_ASSET_PACK_REAL_INFERENCE'],
    requiredLiteralValue: '1',
    posture: 'staging-testnet-real-inference-required',
  },
});

const LANE_REQUIREMENTS = Object.freeze({
  local: [
    ENVIRONMENT_FAMILIES.sandboxAuth,
    ENVIRONMENT_FAMILIES.sandboxOptIn,
    ENVIRONMENT_FAMILIES.harnessApi,
  ],
  'staging-testnet': [
    ENVIRONMENT_FAMILIES.sandboxAuth,
    ENVIRONMENT_FAMILIES.sandboxOptIn,
    ENVIRONMENT_FAMILIES.harnessApi,
    ENVIRONMENT_FAMILIES.llmProvider,
    ENVIRONMENT_FAMILIES.supabaseUrl,
    ENVIRONMENT_FAMILIES.supabasePublic,
    ENVIRONMENT_FAMILIES.supabaseAdmin,
    ENVIRONMENT_FAMILIES.databaseStreaming,
    ENVIRONMENT_FAMILIES.realInference,
  ],
});

function stableStringify(value) {
  if (typeof value === 'undefined') return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function rootOf(value) {
  return `sha256:${createHash('sha256').update(stableStringify(value)).digest('hex')}`;
}

function parseArgs(argv) {
  const args = {
    lane: 'local',
    dryRun: true,
    execute: false,
    json: false,
    writeReceipt: false,
    includeEnvKeyNames: false,
    receiptDir: DEFAULT_RECEIPT_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--lane') args.lane = argv[++index];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--execute') {
      args.execute = true;
      args.dryRun = false;
    } else if (arg === '--json') args.json = true;
    else if (arg === '--write-receipt') args.writeReceipt = true;
    else if (arg === '--include-env-key-names') args.includeEnvKeyNames = true;
    else if (arg === '--receipt-dir') args.receiptDir = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  if (!V42_REHEARSAL_LANES.includes(args.lane)) {
    throw new Error(`Unsupported V42 rehearsal lane ${args.lane}. Expected one of ${V42_REHEARSAL_LANES.join(', ')}.`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/rehearse-v42-local-staging-mvp.mjs --lane <local|staging-testnet> [--dry-run|--execute] [--json] [--write-receipt]',
      '',
      'Builds a source-safe operator receipt for the V42 local/staging-testnet full MVP rehearsal lane.',
      'Live execution requires BITCODE_V42_REHEARSAL_EXECUTE=1 and delegates to the Vercel Sandbox AssetPack harness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function hostFromUrl(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function readEnvironmentFamily(family, env, includeEnvKeyNames) {
  const observed = family.acceptedKeyNames
    .map((keyName) => ({
      keyName,
      present: typeof env[keyName] === 'string' && env[keyName].length > 0,
      literalMatches: family.requiredLiteralValue ? env[keyName] === family.requiredLiteralValue : true,
      hostMatches: family.requiredHost ? hostFromUrl(env[keyName]) === family.requiredHost : true,
    }))
    .filter((entry) => entry.present);

  const satisfied = observed.some((entry) => entry.literalMatches && entry.hostMatches);
  return {
    familyId: family.familyId,
    required: family.required,
    posture: family.posture,
    present: observed.length > 0,
    satisfied,
    ...(family.requiredHost ? { requiredHost: family.requiredHost } : {}),
    ...(family.requiredLiteralValue ? { requiredLiteralValuePresent: satisfied } : {}),
    ...(includeEnvKeyNames
      ? { acceptedKeyNames: family.acceptedKeyNames, observedKeyNames: observed.map((entry) => entry.keyName) }
      : {}),
    secretValueSerialized: false,
  };
}

function buildReceipt(args, env = process.env) {
  const families = LANE_REQUIREMENTS[args.lane].map((family) =>
    readEnvironmentFamily(family, env, args.includeEnvKeyNames),
  );
  const missingEnvironmentFamilies = families
    .filter((family) => family.required && !family.satisfied)
    .map((family) => family.familyId);
  const command = {
    commandId: 'pipeline-hosts:qa-asset-pack-sandbox',
    cwd: 'packages/pipeline-hosts',
    argv: ['pnpm', '--filter', '@bitcode/pipeline-hosts', 'run', 'qa:asset-pack:sandbox'],
    dryRun: args.dryRun,
    liveExecutionOptInRequired: true,
    liveExecutionOptInSatisfied: env.BITCODE_V42_REHEARSAL_EXECUTE === '1',
  };
  const withoutRoot = {
    schema: 'bitcode.v42.localStagingMvpRehearsal.operatorReceipt',
    version: 'V42',
    currentTarget: 'V41',
    laneId: args.lane,
    laneClass: args.lane === 'staging-testnet' ? 'staging-testnet-real-inference-full-mvp' : 'local-full-mvp-rehearsal',
    stagingProjectRef: args.lane === 'staging-testnet' ? STAGING_PROJECT_REF : null,
    stagingRestHost: args.lane === 'staging-testnet' ? STAGING_REST_HOST : null,
    generatedAt: 'operator-runtime',
    ready: missingEnvironmentFamilies.length === 0,
    dryRun: args.dryRun,
    stages: [
      'deposit-source',
      'request-read',
      'review-synthesized-need',
      'request-finding-fits',
      'review-assetpack-preview',
      'buy-assetpack-settle',
      'receive-repository-delivery',
    ],
    command,
    environmentFamilies: families,
    missingEnvironmentFamilies,
    receiptArtifactRoot: DEFAULT_RECEIPT_DIR,
    sourceSafety: SOURCE_SAFETY,
  };

  return {
    ...withoutRoot,
    receiptRoot: rootOf(withoutRoot),
  };
}

function writeReceipt(receipt, receiptDir) {
  mkdirSync(receiptDir, { recursive: true });
  const filename = `${receipt.version.toLowerCase()}-${receipt.laneId}-operator-receipt.json`;
  const receiptPath = path.resolve(receiptDir, filename);
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  return receiptPath;
}

function runLiveHarness(receipt) {
  if (!receipt.ready) {
    throw new Error(`Cannot execute V42 rehearsal; missing families: ${receipt.missingEnvironmentFamilies.join(', ')}`);
  }
  if (!receipt.command.liveExecutionOptInSatisfied) {
    throw new Error('Set BITCODE_V42_REHEARSAL_EXECUTE=1 before live rehearsal execution.');
  }

  return spawnSync('pnpm', ['--filter', '@bitcode/pipeline-hosts', 'run', 'qa:asset-pack:sandbox'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      BITCODE_SANDBOX_MODE: process.env.BITCODE_SANDBOX_MODE || 'asset_pack_pipeline',
      BITCODE_PIPELINE_STREAM_TO_DATABASE:
        receipt.laneId === 'staging-testnet'
          ? '1'
          : process.env.BITCODE_PIPELINE_STREAM_TO_DATABASE || '0',
      BITCODE_ENABLE_PIPELINE_HARNESS_API: process.env.BITCODE_ENABLE_PIPELINE_HARNESS_API || '1',
    },
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const receipt = buildReceipt(args);
  let receiptPath = null;
  if (args.writeReceipt) {
    receiptPath = writeReceipt(receipt, args.receiptDir);
  }

  if (args.execute) {
    const result = runLiveHarness(receipt);
    if (result.status !== 0) process.exit(result.status || 1);
  }

  if (args.json) {
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    return;
  }

  process.stdout.write(
    [
      `V42 ${receipt.laneId} full MVP rehearsal receipt ${receipt.receiptRoot}`,
      `ready=${receipt.ready}`,
      receiptPath ? `receipt=${receiptPath}` : null,
      receipt.missingEnvironmentFamilies.length
        ? `missing=${receipt.missingEnvironmentFamilies.join(',')}`
        : 'missing=none',
    ]
      .filter(Boolean)
      .join(' '),
  );
  process.stdout.write('\n');
}

main();
