#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PROVEN_GENERATOR_ID,
  defaultProvenOutputPath,
  generateCanonicalProvenMarkdown
} from '../scripts/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{
   *   version?: string,
   *   commit?: string,
   *   generatedAt?: string,
   *   worktreeState?: string,
   *   output?: string,
 *   check?: boolean,
 *   allowDirty?: boolean,
 *   stdout?: boolean,
 *   dryRun?: boolean,
 *   help?: boolean
 * }} */
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version') args.version = argv[++index];
    else if (arg === '--commit') args.commit = argv[++index];
    else if (arg === '--generated-at') args.generatedAt = argv[++index];
    else if (arg === '--worktree-state') args.worktreeState = argv[++index];
    else if (arg === '--output') args.output = argv[++index];
    else if (arg === '--check') args.check = true;
    else if (arg === '--allow-dirty') args.allowDirty = true;
    else if (arg === '--stdout') args.stdout = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/generate-bitcode-proven.mjs [options]',
      '',
      'Options:',
      '  --version <VN>         Override canonical version. Defaults to BITCODE_SPEC.txt.',
      '  --commit <sha>         Canonical commit to render. Defaults to HEAD.',
      '  --generated-at <iso>   Override generation timestamp. Defaults to commit recorded-at time.',
      '  --worktree-state <s>   Override recorded replay worktree state. Defaults to live git state.',
      '  --output <path>        Output markdown path. Defaults to the active Bitcode or archived proven appendix path for the requested version.',
      '  --check                Fail if the target file differs from generator output.',
      '  --allow-dirty          Allow generation from a dirty worktree for preview use.',
      '  --stdout               Print markdown to stdout instead of writing a file.',
      '  --dry-run              Print source-safe output summaries without writing files.',
      '  --help                 Show this help.'
    ].join('\n')
  );
}

const SECRET_SHAPED_PATTERN = new RegExp([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_')
].map((marker) => marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'u');

/**
 * @param {string[]} args
 * @returns {string}
 */
function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim();
}

/**
 * @param {string} value
 */
function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

/**
 * @param {string} value
 */
function byteLength(value) {
  return Buffer.byteLength(value, 'utf8');
}

/**
 * @param {string} value
 */
function sourceSafePreview(value) {
  const singleLine = value.replace(/\s+/gu, ' ').trim();
  if (!singleLine) return '<empty>';
  if (SECRET_SHAPED_PATTERN.test(singleLine)) return '<redacted-secret-shaped-line>';
  return singleLine.length > 160 ? `${singleLine.slice(0, 157)}...` : singleLine;
}

/**
 * @param {string} relativePath
 * @param {string} expected
 * @param {string | null} actual
 * @param {'proven-stale' | 'artifact-drift' | 'missing-artifact'} failureClass
 */
function buildSourceSafeDiffSummary(relativePath, expected, actual, failureClass) {
  const expectedLines = expected.split('\n');
  const actualLines = actual === null ? [] : actual.split('\n');
  let firstDifferenceLine = 1;
  const lineCount = Math.max(expectedLines.length, actualLines.length);
  for (let index = 0; index < lineCount; index += 1) {
    if (expectedLines[index] !== actualLines[index]) {
      firstDifferenceLine = index + 1;
      break;
    }
  }
  return {
    path: relativePath,
    failureClass,
    expectedSha256: sha256(expected),
    actualSha256: actual === null ? 'missing' : sha256(actual),
    expectedBytes: byteLength(expected),
    actualBytes: actual === null ? 0 : byteLength(actual),
    firstDifferenceLine,
    expectedLinePreview: sourceSafePreview(expectedLines[firstDifferenceLine - 1] || ''),
    actualLinePreview: actual === null ? '<missing>' : sourceSafePreview(actualLines[firstDifferenceLine - 1] || '')
  };
}

/**
 * @param {ReturnType<typeof buildSourceSafeDiffSummary>} summary
 */
function formatSourceSafeDiffSummary(summary) {
  return [
    `- path=${summary.path}`,
    `  class=${summary.failureClass}`,
    `  expected=${summary.expectedSha256} bytes=${summary.expectedBytes}`,
    `  actual=${summary.actualSha256} bytes=${summary.actualBytes}`,
    `  firstDifferenceLine=${summary.firstDifferenceLine}`,
    `  expectedLine=${summary.expectedLinePreview}`,
    `  actualLine=${summary.actualLinePreview}`
  ].join('\n');
}

/**
 * @param {string} filePath
 * @returns {Promise<string | null>}
 */
async function readExistingText(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * @param {string} outputPath
 * @param {string} markdown
 * @param {Record<string, string>} artifacts
 */
function buildGeneratedOutputSummaries(outputPath, markdown, artifacts) {
  return [
    {
      path: path.relative(repoRoot, outputPath),
      sha256: sha256(markdown),
      bytes: byteLength(markdown),
      kind: 'proven-markdown'
    },
    ...Object.entries(artifacts).map(([artifactPath, content]) => ({
      path: artifactPath,
      sha256: sha256(content),
      bytes: byteLength(content),
      kind: 'generated-artifact'
    }))
  ];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (args.dryRun && args.stdout) {
    throw new Error('--dry-run and --stdout are mutually exclusive.');
  }

  const dirty = git(['status', '--porcelain']);
  if (dirty && !args.allowDirty) {
    throw new Error('Refusing to generate _PROVEN_ from a dirty worktree. Use --allow-dirty for preview generation, or regenerate from a clean canonical commit.');
  }
  const liveWorktreeState = dirty ? 'dirty-preview' : 'clean';
  const worktreeState = args.worktreeState || liveWorktreeState;
  if (!['clean', 'dirty-preview'].includes(worktreeState)) {
    throw new Error(`Unsupported worktree state ${worktreeState}. Expected clean or dirty-preview.`);
  }

  const version = (args.version || (await fs.readFile(path.join(repoRoot, 'BITCODE_SPEC.txt'), 'utf8')).trim());
  if (!/^V\d+$/.test(version)) {
    throw new Error(`Resolved canonical version must look like VN. Received ${version}.`);
  }

  const canonicalCommit = args.commit || git(['rev-parse', 'HEAD']);
  const canonicalCommitRecordedAt = git(['show', '-s', '--format=%cI', canonicalCommit]);
  const generatedAt = args.generatedAt || canonicalCommitRecordedAt;
  const outputPath = path.resolve(repoRoot, args.output || defaultProvenOutputPath(version));

  const { data, markdown, artifacts = {} } = generateCanonicalProvenMarkdown({
    version,
    canonicalCommit,
    canonicalCommitRecordedAt,
    generatedAt,
    worktreeState,
    generatorId: PROVEN_GENERATOR_ID
  });

  if (args.stdout) {
    process.stdout.write(markdown);
    return;
  }

  if (args.dryRun) {
    process.stdout.write(`Dry-run generated ${version} proof outputs without writing files.\n`);
    for (const summary of buildGeneratedOutputSummaries(outputPath, markdown, artifacts)) {
      process.stdout.write(`- ${summary.kind} ${summary.path} ${summary.sha256} bytes=${summary.bytes}\n`);
    }
    process.stdout.write(`generator=${data.generatorId} commit=${data.canonicalCommit} runs=${data.aggregate.runCount} artifacts=${Object.keys(artifacts).length}\n`);
    return;
  }

  if (args.check) {
    const mismatches = [];
    const existing = await readExistingText(outputPath);
    if (existing !== markdown) {
      mismatches.push(buildSourceSafeDiffSummary(
        path.relative(repoRoot, outputPath),
        markdown,
        existing,
        existing === null ? 'missing-artifact' : 'proven-stale'
      ));
    }
    for (const [artifactPath, content] of Object.entries(artifacts)) {
      const resolvedArtifactPath = path.resolve(repoRoot, artifactPath);
      const existingArtifact = await readExistingText(resolvedArtifactPath);
      if (existingArtifact !== content) {
        mismatches.push(buildSourceSafeDiffSummary(
          artifactPath,
          content,
          existingArtifact,
          existingArtifact === null ? 'missing-artifact' : 'artifact-drift'
        ));
      }
    }
    if (mismatches.length) {
      throw new Error([
        `Generated proof outputs are stale for ${version} @ ${canonicalCommit}. Regenerate them with source-safe generated artifact diffs.`,
        ...mismatches.map(formatSourceSafeDiffSummary)
      ].join('\n'));
    }
    process.stdout.write(`_PROVEN_ is current: ${path.relative(repoRoot, outputPath)}\n`);
    process.stdout.write(`generator=${data.generatorId} commit=${data.canonicalCommit} runs=${data.aggregate.runCount} artifacts=${Object.keys(artifacts).length}\n`);
    return;
  }

  await fs.writeFile(outputPath, markdown, 'utf8');
  for (const [artifactPath, content] of Object.entries(artifacts)) {
    const resolvedArtifactPath = path.resolve(repoRoot, artifactPath);
    await fs.mkdir(path.dirname(resolvedArtifactPath), { recursive: true });
    await fs.writeFile(resolvedArtifactPath, content, 'utf8');
  }
  process.stdout.write(`Wrote ${path.relative(repoRoot, outputPath)}\n`);
  if (Object.keys(artifacts).length) {
    process.stdout.write(`Wrote ${Object.keys(artifacts).length} generated artifacts\n`);
  }
  process.stdout.write(`generator=${data.generatorId} commit=${data.canonicalCommit} runs=${data.aggregate.runCount} fullyProven=${data.aggregate.fullyProven}\n`);
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
});
