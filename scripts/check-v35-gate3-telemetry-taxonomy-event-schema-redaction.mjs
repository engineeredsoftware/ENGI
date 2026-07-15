#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v35-telemetry-taxonomy-catalog.json';

const REQUIRED_EVENT_FAMILIES = [
  'pipeline',
  'execution',
  'ptrr_agent',
  'thricified_generation',
  'tool',
  'ledger',
  'wallet',
  'storage',
  'interface',
  'deployment',
  'observer',
  'repair',
  'docs_qa',
  'promotion',
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
      'Usage: node scripts/check-v35-gate3-telemetry-taxonomy-event-schema-redaction.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 3 TelemetryTaxonomyCatalog source, generated artifact, tests, specs, workflows, and redaction posture.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-(?:[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 3+ work must occur on version/v35 or v35/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/telemetry-taxonomy-catalog.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v35-telemetry-taxonomy-catalog.test.js',
    'scripts/generate-v35-telemetry-taxonomy-catalog.mjs',
    'scripts/check-v35-gate3-telemetry-taxonomy-event-schema-redaction.mjs',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'specifications/BITCODE_SPEC_V35.md',
    'specifications/BITCODE_SPEC_V35_DELTA.md',
    'specifications/BITCODE_SPEC_V35_NOTES.md',
    'specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-telemetry-taxonomy-catalog']);
    } catch (error) {
      failures.push(`V35 telemetry taxonomy artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['--dir', 'scripts/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v35-telemetry-taxonomy-catalog.test.js']);
    } catch (error) {
      failures.push(`V35 telemetry taxonomy package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 telemetry taxonomy must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-telemetry-taxonomy-catalog', 'Telemetry taxonomy artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.telemetryTaxonomyCatalog.v1', 'Telemetry taxonomy schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Telemetry taxonomy must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Telemetry taxonomy must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-telemetry-taxonomy-metadata',
      'Telemetry taxonomy must be source-safe telemetry metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredEventFamilies, REQUIRED_EVENT_FAMILIES), 'Telemetry taxonomy must enumerate every required family.');
    assertCheck(failures, includesAll(artifact.coverage.observedEventFamilies, REQUIRED_EVENT_FAMILIES), 'Telemetry taxonomy coverage must observe every family.');
    assertCheck(failures, artifact.coverage.eventFamilyCount === REQUIRED_EVENT_FAMILIES.length, 'Telemetry taxonomy must prove fourteen event-family rows.');
    assertCheck(failures, artifact.coverage.totalEventIdCount >= 50, 'Telemetry taxonomy must carry enough event ids for every family lifecycle.');
    for (const [field, label] of [
      ['pipelineRepresented', 'pipeline'],
      ['executionRepresented', 'execution'],
      ['ptrrAgentRepresented', 'PTRR agent'],
      ['thricifiedGenerationRepresented', 'ThricifiedGeneration'],
      ['toolRepresented', 'tool'],
      ['ledgerRepresented', 'ledger'],
      ['walletRepresented', 'wallet'],
      ['storageRepresented', 'storage'],
      ['interfaceRepresented', 'interface'],
      ['deploymentRepresented', 'deployment'],
      ['observerRepresented', 'observer'],
      ['repairRepresented', 'repair'],
      ['docsQaRepresented', 'docs QA'],
      ['promotionRepresented', 'promotion'],
    ]) {
      assertCheck(failures, artifact.coverage[field] === true, `Telemetry taxonomy must represent ${label}.`);
    }
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Telemetry taxonomy must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Telemetry taxonomy must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Telemetry taxonomy must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Telemetry taxonomy must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Telemetry taxonomy must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^telemetry-taxonomy-row:[a-f0-9]{24}$/u.test(row.taxonomyRoot)),
      'Telemetry taxonomy rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Telemetry taxonomy source evidence roots must all exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.forbiddenPayload.includes('raw_protected_prompts') && row.forbiddenPayload.includes('unpaid_assetpack_source')),
      'Telemetry taxonomy rows must name raw protected prompts and unpaid AssetPack source as forbidden payload.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.redactionPosture && row.dashboardPanel && row.runbookLink && row.storageTarget && row.alertThreshold),
      'Telemetry taxonomy rows must name redaction, dashboard, runbook, storage, and alert fields.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V35.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V35_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V35_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'scripts/specifying/src/canonical/telemetry-taxonomy-catalog.js');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');
  const test = read(root, 'scripts/specifying/test/v35-telemetry-taxonomy-catalog.test.js');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V35 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('TelemetryTaxonomyCatalog'), 'V35 docs must name TelemetryTaxonomyCatalog.');
    assertCheck(failures, doc.includes('source-safe-telemetry-taxonomy-metadata'), 'V35 docs must name telemetry source safety verdict.');
    assertCheck(failures, doc.includes('ThricifiedGeneration'), 'V35 docs must name ThricifiedGeneration telemetry.');
    assertCheck(failures, doc.includes('redaction posture'), 'V35 docs must name redaction posture.');
  }

  assertCheck(failures, parity.includes('| Telemetry taxonomy event schema | Gate 3 |') && parity.includes('| closed |'), 'V35 parity must close the Gate 3 matrix row.');
  assertCheck(failures, parity.includes('## Gate 3 Parity') && parity.includes('closed'), 'V35 parity must mark Gate 3 closed.');
  assertCheck(
    failures,
    /Current working gate: V35 Gate (?:4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance past V35 Gate 3 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V35 Gate 3 closure anchor'), 'Roadmap must include a V35 Gate 3 closure anchor.');
  assertCheck(failures, packageJson.includes('"generate:v35-telemetry-taxonomy-catalog"'), 'package.json must expose the Gate 3 generator.');
  assertCheck(failures, packageJson.includes('"check:v35-telemetry-taxonomy-catalog"'), 'package.json must expose the Gate 3 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v35-gate3"'), 'package.json must expose check:v35-gate3.');
  assertCheck(failures, workflow.includes('check-v35-gate3-telemetry-taxonomy-event-schema-redaction.mjs'), 'Gate workflow must run the V35 Gate 3 checker.');
  assertCheck(failures, workflow.includes('v35-telemetry-taxonomy-catalog.test.js'), 'Gate workflow must run the focused V35 telemetry taxonomy test.');
  assertCheck(failures, specifying.includes(ARTIFACT_PATH), 'Spec-family profile must include the telemetry taxonomy artifact path.');

  for (const phrase of [
    'buildTelemetryTaxonomyCatalog',
    'TELEMETRY_EVENT_FAMILIES',
    'TELEMETRY_TAXONOMY_ROWS',
    'ptrr_agent',
    'thricified_generation',
    'docs_qa',
    'promotion',
    'raw_protected_prompts',
    'unpaid_assetpack_source',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 3 source must include ${phrase}.`);
  }

  for (const phrase of ['buildTelemetryTaxonomyCatalog', 'TELEMETRY_EVENT_FAMILIES', 'thricified_generation', 'docs_qa', 'promotion']) {
    assertCheck(failures, test.includes(phrase), `Gate 3 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildTelemetryTaxonomyCatalog'), 'Protocol index must export buildTelemetryTaxonomyCatalog.');
  assertCheck(failures, typeDefs.includes('buildTelemetryTaxonomyCatalog'), 'Protocol type declarations must export buildTelemetryTaxonomyCatalog.');

  if (failures.length > 0) {
    process.stderr.write('V35 Gate 3 telemetry taxonomy event schema and redaction check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V35 Gate 3 telemetry taxonomy event schema and redaction ok rows=${artifact?.rows.length || 0}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
