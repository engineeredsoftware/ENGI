#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json';

const REQUIRED_REHEARSAL_IDS = [
  'local_telemetry_documentation_rehearsal',
  'staging_testnet_telemetry_documentation_rehearsal',
  'dashboard_runbook_lookup_rehearsal',
  'docs_qa_incident_drill',
  'source_safe_proof_root_review',
  'value_bearing_mainnet_blocked_rehearsal',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v35-gate9-local-staging-telemetry-documentation-rehearsal.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 9 LocalStagingTelemetryDocumentationRehearsal source, generated artifact, tests, specs, docs, and workflow wiring.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 9+ work must occur on version/v35 or v35/gate-9..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/local-staging-telemetry-documentation-rehearsal.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v35-local-staging-telemetry-documentation-rehearsal.test.js',
    'scripts/generate-v35-local-staging-telemetry-documentation-rehearsal.mjs',
    'scripts/check-v35-gate9-local-staging-telemetry-documentation-rehearsal.mjs',
    'packages/specifying/src/canonical/v21-specifying.js',
    'BITCODE_SPEC_V35.md',
    'BITCODE_SPEC_V35_DELTA.md',
    'BITCODE_SPEC_V35_NOTES.md',
    'BITCODE_SPEC_V35_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'internal-docs/README.md',
    'uapi/app/terminal/README.md',
    'uapi/app/docs/bitcode-docs-content.ts',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-local-staging-telemetry-documentation-rehearsal']);
    } catch (error) {
      failures.push(`V35 local/staging telemetry documentation rehearsal artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'packages/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v35-local-staging-telemetry-documentation-rehearsal.test.js',
      ]);
    } catch (error) {
      failures.push(`V35 local/staging telemetry documentation rehearsal package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 local/staging rehearsal must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-local-staging-telemetry-documentation-rehearsal', 'Rehearsal artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.localStagingTelemetryDocumentationRehearsal.v1', 'Rehearsal schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Rehearsal must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Rehearsal report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-rehearsal-metadata',
      'Rehearsal report must be source-safe rehearsal metadata.',
    );
    assertCheck(failures, includesAll(artifact.coverage.observedRehearsalIds, REQUIRED_REHEARSAL_IDS), 'Rehearsal must cover every required rehearsal.');
    assertCheck(failures, artifact.coverage.rehearsalCount === REQUIRED_REHEARSAL_IDS.length, 'Rehearsal must prove six rows.');
    assertCheck(failures, artifact.coverage.localRehearsalCovered === true, 'Rehearsal must cover local lane.');
    assertCheck(failures, artifact.coverage.stagingTestnetRehearsalCovered === true, 'Rehearsal must cover staging-testnet lane.');
    assertCheck(failures, artifact.coverage.documentationDiscoveryCovered === true, 'Rehearsal must cover documentation discovery.');
    assertCheck(failures, artifact.coverage.telemetryEventEmissionCovered === true, 'Rehearsal must cover telemetry event emission.');
    assertCheck(failures, artifact.coverage.dashboardRunbookLookupCovered === true, 'Rehearsal must cover dashboard/runbook lookup.');
    assertCheck(failures, artifact.coverage.docsQaCovered === true, 'Rehearsal must cover docs QA.');
    assertCheck(failures, artifact.coverage.incidentDrillCovered === true, 'Rehearsal must cover incident drill.');
    assertCheck(failures, artifact.coverage.sourceSafeProofRootReviewCovered === true, 'Rehearsal must cover proof-root review.');
    assertCheck(failures, artifact.coverage.documentationSurfacesCovered === true, 'Rehearsal must cover documentation surfaces.');
    assertCheck(failures, artifact.coverage.interfaceSurfacesCovered === true, 'Rehearsal must cover interface surfaces.');
    assertCheck(failures, artifact.coverage.docsQaBindingsCovered === true, 'Rehearsal must cover docs QA bindings.');
    assertCheck(failures, artifact.coverage.runbookLinksCovered === true, 'Rehearsal must cover runbooks.');
    assertCheck(failures, artifact.coverage.dashboardPanelsCovered === true, 'Rehearsal must cover dashboard panels.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetVisibleAndBlocked === true, 'Rehearsal must visibly block value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.missingSourceRoots.length === 0, 'Rehearsal must have no missing source roots.');
    assertCheck(failures, artifact.coverage.rowsMissingRequiredPhases.length === 0, 'Rehearsal rows must cover required phases.');
    assertCheck(failures, artifact.coverage.rowsMissingEventIds.length === 0, 'Rehearsal rows must have event ids.');
    assertCheck(failures, artifact.coverage.rowsMissingProofRoots.length === 0, 'Rehearsal rows must have proof roots.');
    assertCheck(failures, artifact.coverage.rowsMissingDashboards.length === 0, 'Rehearsal rows must have dashboards.');
    assertCheck(failures, artifact.coverage.rowsMissingRunbooks.length === 0, 'Rehearsal rows must have runbooks.');
    assertCheck(failures, artifact.coverage.rowsMissingDocsQa.length === 0, 'Rehearsal rows must have docs QA bindings.');
    assertCheck(failures, artifact.coverage.rowsMissingEvidence.length === 0, 'Rehearsal rows must have evidence roots.');
    assertCheck(failures, artifact.coverage.rowsMissingSourceSafeLogs.length === 0, 'Rehearsal rows must have source-safe screenshot/log roots.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Rehearsal must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Rehearsal must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Rehearsal must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Rehearsal must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Rehearsal must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^telemetry-docs-rehearsal-row:[a-f0-9]{24}$/u.test(row.rehearsalRoot)),
      'Rehearsal rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.allowedPayloadFields.includes('eventIds') && row.allowedPayloadFields.includes('proofRoots') && row.allowedPayloadFields.includes('runbookIds')),
      'Rehearsal rows must expose event ids, proof roots, and runbook ids as allowed fields.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Rehearsal source evidence must be present.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V35.md');
  const delta = read(root, 'BITCODE_SPEC_V35_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V35_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V35_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const rootPackage = read(root, 'package.json');
  const protocolIndex = read(root, 'packages/specifying/src/index.js');
  const protocolDts = read(root, 'packages/specifying/src/index.d.ts');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const internalDocs = read(root, 'internal-docs/README.md');
  const terminalDocs = read(root, 'uapi/app/terminal/README.md');
  const publicDocs = read(root, 'uapi/app/docs/bitcode-docs-content.ts');

  for (const doc of [spec, delta, notes, parity, roadmap, protocolReadme, rootReadme, internalDocs, terminalDocs, publicDocs]) {
    assertCheck(failures, doc.includes('LocalStagingTelemetryDocumentationRehearsal'), 'Docs/specs must name LocalStagingTelemetryDocumentationRehearsal.');
  }

  assertCheck(failures, spec.includes(ARTIFACT_PATH), 'V35 spec must list the rehearsal artifact.');
  assertCheck(failures, delta.includes('Gate 9') && delta.includes('source-safe-rehearsal-metadata'), 'V35 delta must close Gate 9 source-safe rehearsal metadata.');
  assertCheck(failures, notes.includes('Gate 9 closure'), 'V35 notes must record Gate 9 closure.');
  assertCheck(failures, parity.includes('| Local staging telemetry documentation rehearsal | Gate 9 |') && parity.includes('| Local/staging rehearsal source |'), 'V35 parity must close Gate 9 rows.');
  assertCheck(failures, roadmap.includes('V35 Gate 9 closure anchor'), 'Roadmap must include Gate 9 closure anchor.');
  assertCheck(failures, workflow.includes('check-v35-gate9-local-staging-telemetry-documentation-rehearsal.mjs'), 'Gate quality workflow must run Gate 9 checker when present.');
  assertCheck(failures, workflow.includes('v35-local-staging-telemetry-documentation-rehearsal.test.js'), 'Gate quality workflow must run Gate 9 package test.');
  assertCheck(failures, rootPackage.includes('check:v35-gate9'), 'package.json must expose check:v35-gate9.');
  assertCheck(failures, rootPackage.includes('generate:v35-local-staging-telemetry-documentation-rehearsal'), 'package.json must expose rehearsal generator.');
  assertCheck(failures, protocolIndex.includes('buildLocalStagingTelemetryDocumentationRehearsal'), 'Protocol package must export rehearsal builder.');
  assertCheck(failures, protocolDts.includes('buildLocalStagingTelemetryDocumentationRehearsal'), 'Protocol package d.ts must export rehearsal builder.');

  if (failures.length > 0) {
    process.stderr.write(`V35 Gate 9 local/staging telemetry documentation rehearsal check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V35 Gate 9 local/staging telemetry documentation rehearsal check passed: ${artifact?.artifactRoot || 'artifact pending'}\n`);
}

main();
