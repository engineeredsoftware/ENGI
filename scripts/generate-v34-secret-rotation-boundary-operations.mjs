#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v34-secret-rotation-boundary-operations.json';
const GENERATED_AT = '2026-05-23T00:00:00.000Z';

const requiredFamilyIds = Object.freeze([
  'model_provider_openai',
  'database_supabase_project',
  'deployment_vercel_project',
  'vcs_github_app',
  'wallet_signer_material',
  'object_storage_encryption',
  'webhook_signing',
  'mcp_server_auth',
  'chatgpt_app_auth',
]);

const nonValueLanes = Object.freeze([
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
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

const familyRows = Object.freeze([
  {
    familyId: 'model_provider_openai',
    label: 'OpenAI model-provider family',
    credentialClass: 'model_provider_project_key',
    storageOwner: 'vercel_project_environment',
    ownerPackage: 'packages/pipelines/asset-pack',
    requiredHostIds: ['api', 'pipeline_workers'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_30_days',
    rotationCommand: 'rotate model provider credential through operator secret store and sync lane alias',
    verificationCommand: 'reading pipeline contract focused test',
    ciMaskingPosture: 'masked presence class only',
    leakResponsePath: 'revoke provider credential, rotate lane alias, run reading smoke, append audit event',
    leakSeverity: 'staging_testnet_blocking',
    blastRadiusNote: 'model inference pauses while generated artifacts remain source-safe',
    runtimeAvailabilityCheck: 'pipeline host preflight checks provider presence without echoing value',
    auditEventName: 'secret_rotation.model_provider_openai',
    serializedValuePolicy: 'family id and presence class only',
    proofRootBasis: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'],
  },
  {
    familyId: 'database_supabase_project',
    label: 'Supabase database project family',
    credentialClass: 'database_project_server_secret',
    storageOwner: 'supabase_project_secret_store',
    ownerPackage: 'packages/supabase',
    requiredHostIds: ['api', 'database_projection', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_60_days',
    rotationCommand: 'rotate database project secret and refresh untracked lane environment',
    verificationCommand: 'database health and reconciliation focused checks',
    ciMaskingPosture: 'masked database presence class only',
    leakResponsePath: 'revoke project secret, rotate database credential out of band, replay projection health',
    leakSeverity: 'staging_testnet_blocking',
    blastRadiusNote: 'database projection writes pause while ledger roots remain replayable',
    runtimeAvailabilityCheck: 'database health reports project posture and readback counts only',
    auditEventName: 'secret_rotation.database_supabase_project',
    serializedValuePolicy: 'project posture, root, and readback class only',
    proofRootBasis: ['DeploymentStoragePosture', 'SupabaseReadbackReceipt'],
  },
  {
    familyId: 'deployment_vercel_project',
    label: 'Vercel deployment authentication family',
    credentialClass: 'deployment_platform_token',
    storageOwner: 'vercel_project_environment',
    ownerPackage: 'apps/uapi',
    requiredHostIds: ['website', 'api', 'pipeline_workers'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'on_provider_expiry',
    rotationCommand: 'refresh Vercel project authentication and revoke stale operator token',
    verificationCommand: 'pipeline harness preflight focused test',
    ciMaskingPosture: 'masked deployment token with provider-managed OIDC',
    leakResponsePath: 'revoke token, refresh OIDC session, redeploy preview, replay preflight',
    leakSeverity: 'interface_boundary_blocking',
    blastRadiusNote: 'deployments and Sandbox creation pause until auth refresh verifies',
    runtimeAvailabilityCheck: 'preflight validates deployment auth posture without token text',
    auditEventName: 'secret_rotation.deployment_vercel_project',
    serializedValuePolicy: 'provider authentication state only',
    proofRootBasis: ['DeploymentHostCapabilityCatalog', 'DistributedExecutionRuntimeReceipt'],
  },
  {
    familyId: 'vcs_github_app',
    label: 'GitHub App repository access family',
    credentialClass: 'repository_provider_installation_secret',
    storageOwner: 'github_app_installation',
    ownerPackage: 'packages/generic-tools/vcs',
    requiredHostIds: ['api', 'pipeline_workers', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_90_days',
    rotationCommand: 'rotate GitHub App installation credential and refresh connection record',
    verificationCommand: 'VCS routes focused test',
    ciMaskingPosture: 'masked repository provider token',
    leakResponsePath: 'revoke installation secret, reauthorize app, block PR delivery until readback passes',
    leakSeverity: 'interface_boundary_blocking',
    blastRadiusNote: 'repository clone and PR delivery pause; rights state remains ledgered',
    runtimeAvailabilityCheck: 'VCS connection readback reports provider readiness and scopes class only',
    auditEventName: 'secret_rotation.vcs_github_app',
    serializedValuePolicy: 'connection id, provider id, and scopes class only',
    proofRootBasis: ['AuxillariesConnectionReadiness', 'CreatePullRequestDelivery'],
  },
  {
    familyId: 'wallet_signer_material',
    label: 'wallet signer material family',
    credentialClass: 'wallet_signing_material',
    storageOwner: 'wallet_signer_vault',
    ownerPackage: 'packages/btd',
    requiredHostIds: ['ledger_broadcasters', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'on_wallet_policy_change',
    rotationCommand: 'rotate signer material in wallet vault and update watch descriptor',
    verificationCommand: 'BTC fee operation focused test',
    ciMaskingPosture: 'masked away from CI; deterministic non-value fixtures only',
    leakResponsePath: 'freeze broadcaster, revoke signer, move funds by operator policy, require new wallet proof',
    leakSeverity: 'wallet_boundary_blocking',
    blastRadiusNote: 'BTC broadcast and settlement finality pause; unpaid source stays locked',
    runtimeAvailabilityCheck: 'wallet pane reports signer posture and network class without signer bytes',
    auditEventName: 'secret_rotation.wallet_signer_material',
    serializedValuePolicy: 'wallet capability and watch descriptor root only',
    proofRootBasis: ['BtcFeeOperation', 'WalletCapability'],
  },
  {
    familyId: 'object_storage_encryption',
    label: 'object storage encryption family',
    credentialClass: 'object_storage_encryption_key_reference',
    storageOwner: 'object_storage_key_manager',
    ownerPackage: 'packages/pipeline-hosts',
    requiredHostIds: ['object_storage', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_90_days',
    rotationCommand: 'rotate object storage key reference and rewrite protected-object envelope roots',
    verificationCommand: 'deployment storage posture check',
    ciMaskingPosture: 'masked provider-managed object storage key reference',
    leakResponsePath: 'disable object key reference, re-encrypt protected objects, verify roots, block source delivery during repair',
    leakSeverity: 'mainnet_dry_run_blocking',
    blastRadiusNote: 'protected AssetPack object reads pause until encrypted object roots are rewritten',
    runtimeAvailabilityCheck: 'storage posture compares object root and key-reference posture without payload access',
    auditEventName: 'secret_rotation.object_storage_encryption',
    serializedValuePolicy: 'object root and key-reference class only',
    proofRootBasis: ['DeploymentStoragePosture', 'AssetPackPreview'],
  },
  {
    familyId: 'webhook_signing',
    label: 'webhook signing family',
    credentialClass: 'webhook_signature_secret',
    storageOwner: 'interface_connector_secret_store',
    ownerPackage: 'apps/uapi',
    requiredHostIds: ['api', 'runtime_observers'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_60_days',
    rotationCommand: 'rotate webhook signing secret and update receiver verification alias',
    verificationCommand: 'provider webhook route focused test',
    ciMaskingPosture: 'masked webhook secret with signature fixtures only',
    leakResponsePath: 'disable compromised webhook alias, rotate receiver secret, replay delivery fixture',
    leakSeverity: 'interface_boundary_blocking',
    blastRadiusNote: 'incoming provider events are quarantined until receiver verification passes',
    runtimeAvailabilityCheck: 'webhook receiver reports verification verdict and event root only',
    auditEventName: 'secret_rotation.webhook_signing',
    serializedValuePolicy: 'signature verification verdict only',
    proofRootBasis: ['InterfaceTelemetryProofHook', 'RuntimeObserverRepairJob'],
  },
  {
    familyId: 'mcp_server_auth',
    label: 'MCP server auth family',
    credentialClass: 'mcp_transport_auth_secret',
    storageOwner: 'interface_connector_secret_store',
    ownerPackage: 'apps/mcp',
    requiredHostIds: ['mcp_api', 'api'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_60_days',
    rotationCommand: 'rotate MCP transport auth secret and refresh server-side auth policy',
    verificationCommand: 'MCP auth focused test',
    ciMaskingPosture: 'masked MCP auth values',
    leakResponsePath: 'revoke connector secret, disable MCP tools, refresh auth policy, re-run auth suite',
    leakSeverity: 'interface_boundary_blocking',
    blastRadiusNote: 'MCP tool ingress pauses while other surfaces remain independently governed',
    runtimeAvailabilityCheck: 'MCP auth preflight emits policy id, denial reason, and repair action only',
    auditEventName: 'secret_rotation.mcp_server_auth',
    serializedValuePolicy: 'auth policy id and verdict only',
    proofRootBasis: ['McpToolContract', 'InterfaceAuthorizationPolicy'],
  },
  {
    familyId: 'chatgpt_app_auth',
    label: 'ChatGPT App connector auth family',
    credentialClass: 'chatgpt_app_connector_secret',
    storageOwner: 'interface_connector_secret_store',
    ownerPackage: 'packages/chatgptapp',
    requiredHostIds: ['chatgpt_app', 'api'],
    supportedLaneIds: nonValueLanes,
    rotationCadence: 'every_60_days',
    rotationCommand: 'rotate ChatGPT App connector secret and refresh action admission policy',
    verificationCommand: 'ChatGPT App action contract focused test',
    ciMaskingPosture: 'masked connector values',
    leakResponsePath: 'revoke connector secret, disable app actions, refresh policy, re-run action contract tests',
    leakSeverity: 'interface_boundary_blocking',
    blastRadiusNote: 'ChatGPT App actions pause while API and product routes remain available',
    runtimeAvailabilityCheck: 'action admission reports connector posture and denial reason only',
    auditEventName: 'secret_rotation.chatgpt_app_auth',
    serializedValuePolicy: 'connector posture and action verdict only',
    proofRootBasis: ['ChatgptAppActionContract', 'InterfaceAuthorizationPolicy'],
  },
]);

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileExists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function stableRoot(prefix, parts) {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

function scanFile(relativePath, tokens) {
  const contents = fileExists(relativePath) ? read(relativePath) : '';
  return {
    path: relativePath,
    digest: `sha256:${createHash('sha256').update(contents).digest('hex')}`,
    requiredTokens: tokens.map((token) => ({
      token,
      present: contents.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

function assertNoSerializedSecrets(value, failures) {
  const serialized = JSON.stringify(value);
  for (const marker of secretMarkers) {
    if (serialized.includes(marker)) failures.push(`Serialized artifact contains forbidden secret/source marker: ${marker}`);
  }
  if (/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serialized)) {
    failures.push('Serialized artifact contains an env-assignment-shaped value.');
  }
}

function buildArtifact() {
  const failures = [];
  const observedFamilyIds = familyRows.map((row) => row.familyId);
  const missingFamilyIds = requiredFamilyIds.filter((id) => !observedFamilyIds.includes(id));
  const duplicateFamilyIds = observedFamilyIds.filter((id, index) => observedFamilyIds.indexOf(id) !== index);
  const sourceEvidence = [
    scanFile('packages/btd/src/secret-rotation-plan.ts', [
      'SecretRotationPlan',
      'SECRET_ROTATION_FAMILY_IDS',
      'model_provider_openai',
      'database_supabase_project',
      'deployment_vercel_project',
      'vcs_github_app',
      'wallet_signer_material',
      'object_storage_encryption',
      'webhook_signing',
      'mcp_server_auth',
      'chatgpt_app_auth',
      'noSerializedSecretValues',
      'valueBearingMainnetBlocked',
    ]),
    scanFile('packages/btd/src/index.ts', ["./secret-rotation-plan"]),
    scanFile('packages/btd/package.json', ['./secret-rotation-plan']),
  ];
  const testEvidence = [
    scanFile('packages/btd/__tests__/secret-rotation-plan.test.ts', [
      'fails closed when a required secret family is missing',
      'fails closed when CI masking posture is missing',
      'fails closed on serialized secret-shaped values',
      'value-bearing mainnet',
    ]),
  ];

  for (const row of familyRows) {
    if (!row.rotationCommand) failures.push(`${row.familyId} missing rotation command.`);
    if (!row.verificationCommand) failures.push(`${row.familyId} missing verification command.`);
    if (!row.ciMaskingPosture.toLowerCase().includes('mask')) failures.push(`${row.familyId} missing CI masking posture.`);
    if (!row.leakResponsePath) failures.push(`${row.familyId} missing leak response path.`);
    if (!row.blastRadiusNote) failures.push(`${row.familyId} missing blast radius note.`);
    if (!row.runtimeAvailabilityCheck) failures.push(`${row.familyId} missing runtime availability check.`);
    if (!row.auditEventName.startsWith('secret_rotation.')) failures.push(`${row.familyId} missing audit event name.`);
    if (row.supportedLaneIds.includes('value-bearing-mainnet')) failures.push(`${row.familyId} admits value-bearing mainnet.`);
  }
  if (missingFamilyIds.length > 0) failures.push(`Missing secret families: ${missingFamilyIds.join(', ')}`);
  if (duplicateFamilyIds.length > 0) failures.push(`Duplicate secret families: ${duplicateFamilyIds.join(', ')}`);
  if (!sourceEvidence.every(allTokensPresent)) failures.push('Source evidence tokens missing.');
  if (!testEvidence.every(allTokensPresent)) failures.push('Test evidence tokens missing.');
  assertNoSerializedSecrets(familyRows, failures);

  const families = familyRows.map((row) => ({
    ...row,
    familyRoot: stableRoot('v34-secret-rotation-family', [
      row.familyId,
      row.credentialClass,
      row.storageOwner,
      row.ownerPackage,
      row.requiredHostIds.join(','),
      row.supportedLaneIds.join(','),
      row.rotationCadence,
      row.auditEventName,
      row.proofRootBasis.join(','),
    ]),
    sourceSafety: {
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
    },
  }));

  const artifact = {
    artifactId: 'v34-secret-rotation-boundary-operations',
    schemaId: 'bitcode.v34.secretRotationBoundaryOperations.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-secret-rotation-boundary-metadata',
    passed: failures.length === 0,
    failures,
    planRoot: stableRoot('v34-secret-rotation-plan', families.map((family) => family.familyRoot)),
    requiredFamilyIds,
    families,
    coverage: {
      familyCount: families.length,
      observedFamilyIds,
      missingFamilyIds,
      modelProviderCovered: observedFamilyIds.includes('model_provider_openai'),
      databaseCovered: observedFamilyIds.includes('database_supabase_project'),
      deploymentPlatformCovered: observedFamilyIds.includes('deployment_vercel_project'),
      repositoryProviderCovered: observedFamilyIds.includes('vcs_github_app'),
      walletSignerCovered: observedFamilyIds.includes('wallet_signer_material'),
      objectStorageCovered: observedFamilyIds.includes('object_storage_encryption'),
      webhookCovered: observedFamilyIds.includes('webhook_signing'),
      mcpCovered: observedFamilyIds.includes('mcp_server_auth'),
      chatgptAppCovered: observedFamilyIds.includes('chatgpt_app_auth'),
      rotationCommandsCovered: families.every((family) => Boolean(family.rotationCommand)),
      ciMaskingCovered: families.every((family) => family.ciMaskingPosture.toLowerCase().includes('mask')),
      leakResponseCovered: families.every((family) => Boolean(family.leakResponsePath)),
      blastRadiusCovered: families.every((family) => Boolean(family.blastRadiusNote)),
      runtimeAvailabilityCovered: families.every((family) => Boolean(family.runtimeAvailabilityCheck)),
      auditEventsCovered: families.every((family) => family.auditEventName.startsWith('secret_rotation.')),
      valueBearingMainnetAdmitted: families.some((family) => family.supportedLaneIds.includes('value-bearing-mainnet')),
      credentialsSerialized: false,
      protectedSourceVisible: false,
    },
    sourceEvidence,
    testEvidence,
  };

  assertNoSerializedSecrets(artifact, failures);
  artifact.passed = failures.length === 0;
  artifact.failures = failures;
  return artifact;
}

function parseArgs(argv) {
  return { check: argv.includes('--check') };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildArtifact();
  const output = `${JSON.stringify(artifact, null, 2)}\n`;
  const absolutePath = path.join(repoRoot, ARTIFACT_PATH);

  if (args.check) {
    const current = existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
    if (current !== output) {
      process.stderr.write(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-secret-rotation-boundary-operations.\n`);
      process.exit(1);
    }
    if (!artifact.passed) {
      process.stderr.write(`${ARTIFACT_PATH} failed:\n${artifact.failures.join('\n')}\n`);
      process.exit(1);
    }
    process.stdout.write(`${ARTIFACT_PATH} is current and passed.\n`);
    return;
  }

  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, output);
  if (!artifact.passed) {
    process.stderr.write(`${ARTIFACT_PATH} generated with failures:\n${artifact.failures.join('\n')}\n`);
    process.exit(1);
  }
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

main();
