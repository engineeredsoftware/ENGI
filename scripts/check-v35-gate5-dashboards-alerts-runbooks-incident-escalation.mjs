#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v35-operator-runbook-catalog.json';

const REQUIRED_RUNBOOK_IDS = [
  'runbook.pipeline.execution-repair',
  'runbook.execution.orphan-repair',
  'runbook.inference.ptrr-agent-debug',
  'runbook.inference.generation-redaction',
  'runbook.tools.policy-denial',
  'runbook.ledger.reconciliation-repair',
  'runbook.wallet.signing-failure',
  'runbook.storage.object-repair',
  'runbook.interfaces.auth-denial',
  'runbook.deployment.lane-repair',
  'runbook.observer.finality-lag',
  'runbook.repair.failed',
  'runbook.docs.qa-repair',
  'runbook.promotion.blocked',
];

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
      'Usage: node scripts/check-v35-gate5-dashboards-alerts-runbooks-incident-escalation.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 5 OperatorRunbookCatalog source, generated artifact, tests, specs, docs, and workflow wiring.',
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
      branch === 'version/v35' || /^v35\/gate-(?:[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 5+ work must occur on version/v35 or v35/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/operator-runbook-catalog.js',
    'scripts/specifying/src/canonical/telemetry-taxonomy-catalog.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v35-operator-runbook-catalog.test.js',
    'scripts/generate-v35-operator-runbook-catalog.mjs',
    'scripts/check-v35-gate5-dashboards-alerts-runbooks-incident-escalation.mjs',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'BITCODE_SPEC_V35.md',
    'BITCODE_SPEC_V35_DELTA.md',
    'BITCODE_SPEC_V35_NOTES.md',
    'BITCODE_SPEC_V35_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-operator-runbook-catalog']);
    } catch (error) {
      failures.push(`V35 operator runbook artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v35-operator-runbook-catalog.test.js',
      ]);
    } catch (error) {
      failures.push(`V35 operator runbook package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 operator runbook catalog must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-operator-runbook-catalog', 'Operator runbook artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.operatorRunbookCatalog.v1', 'Operator runbook schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Operator runbooks must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Operator runbook catalog must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-runbook-metadata',
      'Operator runbook catalog must be source-safe runbook metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredRunbookIds, REQUIRED_RUNBOOK_IDS), 'Operator runbook catalog must enumerate every runbook id.');
    assertCheck(failures, includesAll(artifact.coverage.observedRunbookIds, REQUIRED_RUNBOOK_IDS), 'Operator runbook coverage must observe every runbook.');
    assertCheck(failures, includesAll(artifact.coverage.observedEventFamilies, REQUIRED_EVENT_FAMILIES), 'Operator runbooks must bind every telemetry event family.');
    assertCheck(failures, artifact.coverage.runbookCount === REQUIRED_RUNBOOK_IDS.length, 'Operator runbook catalog must prove fourteen rows.');
    assertCheck(failures, artifact.coverage.dashboardPanelCount === REQUIRED_RUNBOOK_IDS.length, 'Operator runbook catalog must prove dashboard panels.');
    assertCheck(failures, artifact.coverage.alertCount === REQUIRED_RUNBOOK_IDS.length, 'Operator runbook catalog must prove alert ids.');
    assertCheck(failures, artifact.coverage.incidentClassCount === REQUIRED_RUNBOOK_IDS.length, 'Operator runbook catalog must prove incident classes.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Operator runbooks must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Operator runbooks must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Operator runbooks must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Operator runbooks must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Operator runbooks must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^operator-runbook-row:[a-f0-9]{24}$/u.test(row.runbookRoot)),
      'Operator runbook rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Operator runbook source evidence roots must exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.commandSequence.length > 0 && row.verificationCommands.length > 0),
      'Operator runbook rows must include command and verification commands.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.escalationPath.length >= 2 && row.postIncidentDocsUpdates.length > 0),
      'Operator runbook rows must include escalation and post-incident documentation update paths.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.forbiddenData.includes('secret_values') && row.forbiddenData.includes('unpaid_assetpack_source')),
      'Operator runbook rows must name forbidden secret and unpaid AssetPack source data.',
    );
  }

  const protocolIndex = read(root, 'scripts/specifying/src/index.js');
  assertCheck(failures, protocolIndex.includes('buildOperatorRunbookCatalog'), 'Protocol index must export buildOperatorRunbookCatalog.');

  const packageTypes = read(root, 'scripts/specifying/src/index.d.ts');
  assertCheck(failures, packageTypes.includes('buildOperatorRunbookCatalog'), 'Protocol type surface must export buildOperatorRunbookCatalog.');

  const packageJson = read(root, 'package.json');
  assertCheck(failures, packageJson.includes('check:v35-gate5'), 'package.json must expose check:v35-gate5.');
  assertCheck(failures, packageJson.includes('generate:v35-operator-runbook-catalog'), 'package.json must expose operator runbook generator.');

  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  assertCheck(failures, workflow.includes('check-v35-gate5-dashboards-alerts-runbooks-incident-escalation.mjs'), 'Gate workflow must run V35 Gate 5 checker when present.');
  assertCheck(failures, workflow.includes('test/v35-operator-runbook-catalog.test.js'), 'Gate workflow must run V35 operator runbook package test.');

  const spec = read(root, 'BITCODE_SPEC_V35.md');
  assertCheck(failures, spec.includes('V35 OperatorRunbookCatalog canon'), 'V35 spec must include OperatorRunbookCatalog canon section.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH), 'V35 spec must name operator runbook artifact.');

  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  assertCheck(failures, roadmap.includes('V35 Gate 5 closure anchor'), 'Roadmap must include V35 Gate 5 closure anchor.');

  if (failures.length > 0) {
    process.stderr.write(`V35 Gate 5 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V35 Gate 5 dashboard alert runbook incident escalation check passed for ${root}\n`);
}

main();
