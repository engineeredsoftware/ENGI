#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  String.fromCharCode(101, 121, 74, 104, 98, 71, 99, 105, 79, 105, 74, 73, 85, 122, 73, 49, 78, 105),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
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

function run(root, command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipPackageTests: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 10 prompt benchmark smoke, source-safe receipts, V41 readiness worklist, docs, workflows, and generated artifact freshness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function parseJson(output, failures, label) {
  try {
    return JSON.parse(output);
  } catch (error) {
    failures.push(`${label} did not emit JSON: ${error.message}`);
    return null;
  }
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

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-(?:10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 10+ work must occur on version/v40 or v40/gate-10..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/run-v40-prompt-benchmark-smoke.mjs',
    'scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs',
    'scripts/check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs',
    'scripts/specifying/src/canonical/v40-prompt-benchmark-smoke-v41-readiness.js',
    'scripts/specifying/test/v40-prompt-benchmark-smoke-v41-readiness.test.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/src/canonical/prompt-benchmark-report.js',
    'scripts/specifying/test/v38-prompt-benchmark-report.test.js',
    'packages/prompts/src/benchmarking/runner.ts',
    'packages/prompts/src/benchmarking/cli.ts',
    'packages/prompts/src/benchmarking/types.ts',
    'packages/prompts/src/benchmarking/README.md',
    'packages/prompts/package.json',
    'BITCODE_SPEC_V40.md',
    'BITCODE_SPEC_V40_DELTA.md',
    'BITCODE_SPEC_V40_NOTES.md',
    'BITCODE_SPEC_V40_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 prompt benchmark smoke artifact check failed: ${error.stderr || error.message}`);
    }
  }

  let smokeReceipt = null;
  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      const output = run(root, 'node', ['scripts/run-v40-prompt-benchmark-smoke.mjs', '--json'], {
        env: {
          ...process.env,
          [SECRET_MARKERS[3]]: '',
          BITCODE_PROMPT_BENCHMARK_PROVIDER: 'source-safe-mock',
        },
      });
      smokeReceipt = parseJson(output, failures, 'V40 prompt benchmark smoke');
      for (const marker of SECRET_MARKERS) {
        assertCheck(failures, !output.includes(marker), `V40 prompt benchmark smoke receipt must not contain secret marker ${marker}.`);
      }
    } catch (error) {
      failures.push(`V40 prompt benchmark smoke command failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v40-prompt-benchmark-smoke-v41-readiness.test.js']);
    } catch (error) {
      failures.push(`V40 prompt benchmark smoke protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 10 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-prompt-benchmark-smoke-v41-readiness', 'Gate 10 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.promptBenchmarkSmokeV41Readiness.v1', 'Gate 10 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 10 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 10 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-prompt-benchmark-smoke-and-v41-readiness',
      'Gate 10 artifact must declare source-safe prompt benchmark metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 10, 'Gate 10 must cover ten rows.');
    assertCheck(failures, artifact.coverage.coveredRowCount === 10, 'Gate 10 rows must all be source-root covered.');
    assertCheck(failures, artifact.coverage.v38BenchmarkReportPassed === true, 'Gate 10 must bind passing V38 benchmark report.');
    assertCheck(failures, artifact.coverage.v38BenchmarkSourceSafeMetadataOnly === true, 'Gate 10 must bind source-safe V38 benchmark report.');
    assertCheck(failures, artifact.coverage.v38BenchmarkRowCount >= 7, 'Gate 10 must bind V38 benchmark rows.');
    assertCheck(failures, artifact.coverage.v38BenchmarkFixtureCount >= 12, 'Gate 10 must bind V38 benchmark fixtures.');
    assertCheck(failures, artifact.coverage.packageBenchmarkReportCommandPresent === true, 'Gate 10 must bind package benchmark report command.');
    assertCheck(failures, artifact.coverage.v41WorkItemCount >= 8, 'Gate 10 must hand off V41 prompt-program work items.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Gate 10 predicates must all pass.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'Gate 10 must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'Gate 10 must not serialize raw provider responses.');
    assertCheck(failures, artifact.sourceSafety.promptContentRewriteAllowedInV40 === false, 'Gate 10 must defer prompt rewriting to V41.');
  }

  if (smokeReceipt) {
    assertCheck(failures, smokeReceipt.passed === true, 'Gate 10 smoke receipt must pass.');
    assertCheck(failures, smokeReceipt.coverage.benchmarkExecutionCount === 2, 'Gate 10 smoke receipt must execute two benchmark subjects.');
    assertCheck(failures, smokeReceipt.coverage.promptPartBenchmarkPassed === true, 'Gate 10 PromptPart smoke benchmark must pass.');
    assertCheck(failures, smokeReceipt.coverage.promptBenchmarkPassed === true, 'Gate 10 Prompt smoke benchmark must pass.');
    assertCheck(failures, smokeReceipt.coverage.packageReportPassed === true, 'Gate 10 package report command must pass.');
    assertCheck(failures, smokeReceipt.packageReport.totalBenchmarked > 0, 'Gate 10 package report must benchmark at least one prompt file.');
    assertCheck(failures, smokeReceipt.sourceSafety.rawPromptTextSerialized === false, 'Gate 10 smoke receipt must hide raw prompt text.');
    assertCheck(failures, smokeReceipt.sourceSafety.rawProviderResponseSerialized === false, 'Gate 10 smoke receipt must hide raw provider responses.');
    assertCheck(failures, smokeReceipt.sourceSafety.promptFileMutated === false, 'Gate 10 smoke receipt must be non-mutating.');
  }

  const spec = read(root, 'BITCODE_SPEC_V40.md');
  const delta = read(root, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const doc of [spec, delta, notes, parity, readme, protocolReadme]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `Gate 10 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('V40PromptBenchmarkSmokeV41Readiness'), 'Gate 10 docs must name V40PromptBenchmarkSmokeV41Readiness.');
    assertCheck(failures, doc.includes('PromptPart'), 'Gate 10 docs must name PromptPart.');
    assertCheck(failures, doc.includes('V41'), 'Gate 10 docs must name V41 readiness.');
  }
  assertCheck(failures, roadmap.includes('V40 Gate 10 closure anchor'), 'Roadmap must include a V40 Gate 10 closure anchor.');
  assertCheck(failures, packageJson.includes('"prompt-benchmark:smoke"'), 'package.json must expose prompt-benchmark:smoke.');
  assertCheck(failures, packageJson.includes('"generate:v40-prompt-benchmark-smoke-v41-readiness"'), 'package.json must expose the Gate 10 generator.');
  assertCheck(failures, packageJson.includes('"check:v40-gate10"'), 'package.json must expose check:v40-gate10.');
  assertCheck(failures, gateWorkflow.includes('check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs'), 'Gate workflow must run Gate 10 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs'), 'Canon workflow must run Gate 10 checker.');
  assertCheck(failures, gateWorkflow.includes('v40-prompt-benchmark-smoke-v41-readiness.test.js'), 'Gate workflow must run Gate 10 protocol test.');

  if (failures.length > 0) {
    process.stderr.write('V40 Gate 10 prompt benchmark smoke and V41 readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V40 Gate 10 prompt benchmark smoke and V41 readiness proof passed.\n');
}

main();
