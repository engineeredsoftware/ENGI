#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v35/docs-qa-alignment-report.json';

const REQUIRED_ALIGNMENT_IDS = [
  'spec_family_alignment',
  'roadmap_readme_alignment',
  'generated_artifact_inventory_alignment',
  'catalog_implementation_alignment',
  'public_docs_disclosure_alignment',
  'internal_docs_alignment',
  'route_docs_alignment',
  'interface_docs_alignment',
  'generated_proof_appendix_alignment',
  'workflow_checker_alignment',
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
      'Usage: node scripts/check-v35-gate6-documentation-qa-alignment-proofs.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 6 DocsQaAlignmentReport source, generated artifact, tests, specs, docs, and workflow wiring.',
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-(?:[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 6+ work must occur on version/v35 or v35/gate-6..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/docs-qa-alignment-report.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v35-docs-qa-alignment-report.test.js',
    'scripts/generate-v35-docs-qa-alignment-report.mjs',
    'scripts/check-v35-gate6-documentation-qa-alignment-proofs.mjs',
    'scripts/specifying/src/canonical/v21-specifying.js',
    '.specifications/BITCODE_SPEC_V35.md',
    '.specifications/BITCODE_SPEC_V35_DELTA.md',
    '.specifications/BITCODE_SPEC_V35_NOTES.md',
    '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-docs-qa-alignment-report']);
    } catch (error) {
      failures.push(`V35 docs QA alignment artifact check failed: ${error.stderr || error.message}`);
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
        'test/v35-docs-qa-alignment-report.test.js',
      ]);
    } catch (error) {
      failures.push(`V35 docs QA alignment package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 docs QA alignment report must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-docs-qa-alignment-report', 'Docs QA alignment artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.docsQaAlignmentReport.v1', 'Docs QA alignment schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Docs QA alignment must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Docs QA alignment report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-docs-qa-metadata',
      'Docs QA alignment report must be source-safe docs QA metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredAlignmentIds, REQUIRED_ALIGNMENT_IDS), 'Docs QA report must enumerate every required alignment id.');
    assertCheck(failures, includesAll(artifact.coverage.observedAlignmentIds, REQUIRED_ALIGNMENT_IDS), 'Docs QA coverage must observe every alignment id.');
    assertCheck(failures, artifact.coverage.alignmentCount === REQUIRED_ALIGNMENT_IDS.length, 'Docs QA report must prove ten rows.');
    assertCheck(failures, artifact.coverage.staleTokenBlockers.length === 0, 'Docs QA report must have no stale token blockers.');
    assertCheck(failures, artifact.coverage.missingGeneratedArtifacts.length === 0, 'Docs QA report must have no missing generated artifacts.');
    assertCheck(failures, artifact.coverage.unsupportedDisclosureClaims.length === 0, 'Docs QA report must have no unsupported disclosure claims.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Docs QA report must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Docs QA report must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Docs QA report must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Docs QA report must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Docs QA report must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^docs-qa-alignment-row:[a-f0-9]{24}$/u.test(row.alignmentRoot)),
      'Docs QA alignment rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Docs QA alignment source evidence roots must exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.validationCommand === 'pnpm run check:v35-gate6' && row.failClosedResult.includes('blocked')),
      'Docs QA alignment rows must include validation command and fail-closed result.',
    );
  }

  const protocolIndex = read(root, 'scripts/specifying/src/index.js');
  assertCheck(failures, protocolIndex.includes('buildDocsQaAlignmentReport'), 'Protocol index must export buildDocsQaAlignmentReport.');

  const packageTypes = read(root, 'scripts/specifying/src/index.d.ts');
  assertCheck(failures, packageTypes.includes('buildDocsQaAlignmentReport'), 'Protocol type surface must export buildDocsQaAlignmentReport.');

  const packageJson = read(root, 'package.json');
  assertCheck(failures, packageJson.includes('check:v35-gate6'), 'package.json must expose check:v35-gate6.');
  assertCheck(failures, packageJson.includes('generate:v35-docs-qa-alignment-report'), 'package.json must expose docs QA generator.');

  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  assertCheck(failures, workflow.includes('check-v35-gate6-documentation-qa-alignment-proofs.mjs'), 'Gate workflow must run V35 Gate 6 checker when present.');
  assertCheck(failures, workflow.includes('test/v35-docs-qa-alignment-report.test.js'), 'Gate workflow must run V35 docs QA package test.');

  const spec = read(root, '.specifications/BITCODE_SPEC_V35.md');
  assertCheck(failures, spec.includes('V35 DocsQaAlignmentReport canon'), 'V35 spec must include DocsQaAlignmentReport canon section.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH), 'V35 spec must name docs QA alignment artifact.');

  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  assertCheck(failures, roadmap.includes('V35 Gate 6 closure anchor'), 'Roadmap must include V35 Gate 6 closure anchor.');

  if (failures.length > 0) {
    process.stderr.write(`V35 Gate 6 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V35 Gate 6 documentation QA alignment proof check passed for ${root}\n`);
}

main();
