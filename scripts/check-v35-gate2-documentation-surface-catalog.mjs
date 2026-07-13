#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v35-documentation-surface-catalog.json';

const REQUIRED_SURFACE_IDS = [
  'canonical_spec_family',
  'roadmap_contributor_governance',
  'internal_codebase_docs',
  'public_docs_surface',
  'package_readmes',
  'route_api_docs',
  'api_interface_docs',
  'generated_artifact_docs',
  'deployment_operations_docs',
  'telemetry_observability_docs',
  'demonstration_docs',
  'security_boundary_docs',
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
      'Usage: node scripts/check-v35-gate2-documentation-surface-catalog.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 2 DocumentationSurfaceCatalog source, generated artifact, tests, specs, workflows, and docs posture.',
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
      branch === 'version/v35' || /^v35\/gate-(?:[2-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 2+ work must occur on version/v35 or v35/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/documentation-surface-catalog.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v35-documentation-surface-catalog.test.js',
    'scripts/generate-v35-documentation-surface-catalog.mjs',
    'scripts/check-v35-gate2-documentation-surface-catalog.mjs',
    'packages/specifying/src/canonical/v21-specifying.js',
    'BITCODE_SPEC_V35.md',
    'BITCODE_SPEC_V35_DELTA.md',
    'BITCODE_SPEC_V35_NOTES.md',
    'BITCODE_SPEC_V35_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-documentation-surface-catalog']);
    } catch (error) {
      failures.push(`V35 documentation surface artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['--dir', 'packages/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v35-documentation-surface-catalog.test.js']);
    } catch (error) {
      failures.push(`V35 documentation surface package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 documentation catalog must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-documentation-surface-catalog', 'Documentation catalog artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.documentationSurfaceCatalog.v1', 'Documentation catalog schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Documentation catalog must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Documentation catalog must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-documentation-surface-metadata',
      'Documentation catalog must be source-safe documentation metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredSurfaceIds, REQUIRED_SURFACE_IDS), 'Documentation catalog must enumerate every required surface.');
    assertCheck(failures, includesAll(artifact.coverage.observedSurfaceIds, REQUIRED_SURFACE_IDS), 'Documentation catalog coverage must observe every surface.');
    assertCheck(failures, artifact.coverage.surfaceCount === REQUIRED_SURFACE_IDS.length, 'Documentation catalog must prove twelve documentation rows.');
    assertCheck(failures, artifact.coverage.publicDocsRepresented === true, 'Documentation catalog must represent public docs.');
    assertCheck(failures, artifact.coverage.internalDocsRepresented === true, 'Documentation catalog must represent internal docs.');
    assertCheck(failures, artifact.coverage.routeDocsRepresented === true, 'Documentation catalog must represent route docs.');
    assertCheck(failures, artifact.coverage.packageDocsRepresented === true, 'Documentation catalog must represent package docs.');
    assertCheck(failures, artifact.coverage.generatedArtifactsRepresented === true, 'Documentation catalog must represent generated artifact docs.');
    assertCheck(failures, artifact.coverage.apiInterfaceDocsRepresented === true, 'Documentation catalog must represent API/interface docs.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Documentation catalog must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Documentation catalog must not expose protected source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Documentation catalog must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^documentation-surface-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Documentation catalog rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Documentation catalog source evidence roots must all exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => Array.isArray(row.forbiddenContent) && row.forbiddenContent.includes('unpaid_assetpack_source')),
      'Documentation catalog rows must name unpaid AssetPack source as forbidden content.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V35.md');
  const delta = read(root, 'BITCODE_SPEC_V35_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V35_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V35_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/specifying/src/canonical/documentation-surface-catalog.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v35-documentation-surface-catalog.test.js');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V35 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('DocumentationSurfaceCatalog'), 'V35 docs must name DocumentationSurfaceCatalog.');
    assertCheck(failures, doc.includes('public `/docs`'), 'V35 docs must name public `/docs`.');
    assertCheck(failures, doc.includes('source-safe-documentation-surface-metadata'), 'V35 docs must name documentation source safety verdict.');
  }

  assertCheck(failures, parity.includes('| Documentation surface catalog | Gate 2 |') && parity.includes('| closed |'), 'V35 parity must close the Gate 2 matrix row.');
  assertCheck(failures, parity.includes('## Gate 2 Parity') && parity.includes('closed'), 'V35 parity must mark Gate 2 closed.');
  assertCheck(
    failures,
    /Current working gate: V35 Gate (?:3|4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance past V35 Gate 2 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V35 Gate 2 closure anchor'), 'Roadmap must include a V35 Gate 2 closure anchor.');
  assertCheck(failures, packageJson.includes('"generate:v35-documentation-surface-catalog"'), 'package.json must expose the Gate 2 generator.');
  assertCheck(failures, packageJson.includes('"check:v35-documentation-surface-catalog"'), 'package.json must expose the Gate 2 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v35-gate2"'), 'package.json must expose check:v35-gate2.');
  assertCheck(failures, workflow.includes('check-v35-gate2-documentation-surface-catalog.mjs'), 'Gate workflow must run the V35 Gate 2 checker.');
  assertCheck(failures, workflow.includes('v35-documentation-surface-catalog.test.js'), 'Gate workflow must run the focused V35 documentation catalog test.');
  assertCheck(failures, specifying.includes(ARTIFACT_PATH), 'Spec-family profile must include the documentation surface artifact path.');

  for (const phrase of [
    'buildDocumentationSurfaceCatalog',
    'DOCUMENTATION_SURFACE_IDS',
    'DOCUMENTATION_SURFACE_ROWS',
    'public_docs_surface',
    'internal_codebase_docs',
    'route_api_docs',
    'generated_artifact_docs',
    'api_interface_docs',
    'security_boundary_docs',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 2 source must include ${phrase}.`);
  }

  for (const phrase of ['buildDocumentationSurfaceCatalog', 'DOCUMENTATION_SURFACE_IDS', 'public_docs_surface', 'generated_artifact_docs']) {
    assertCheck(failures, test.includes(phrase), `Gate 2 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildDocumentationSurfaceCatalog'), 'Protocol index must export buildDocumentationSurfaceCatalog.');
  assertCheck(failures, typeDefs.includes('buildDocumentationSurfaceCatalog'), 'Protocol type declarations must export buildDocumentationSurfaceCatalog.');

  if (failures.length > 0) {
    process.stderr.write('V35 Gate 2 documentation surface catalog check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V35 Gate 2 documentation surface catalog ok rows=${artifact?.rows.length || 0}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
