#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { buildV21SpecFamilyReport } from '../packages/specifying/src/index.js';

function projectLabel(version) {
  return 'Bitcode';
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{
   *   version?: string,
   *   mode?: string,
   *   currentTarget?: string,
   *   repoRoot?: string,
   *   skipPointerCheck?: boolean,
   *   help?: boolean
   * }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version') args.version = argv[++index];
    else if (arg === '--mode') args.mode = argv[++index];
    else if (arg === '--current-target') args.currentTarget = argv[++index];
    else if (arg === '--repo-root') args.repoRoot = argv[++index];
    else if (arg === '--skip-pointer-check') args.skipPointerCheck = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-bitcode-spec-family.mjs [options]',
      '',
      'Options:',
      '  --version <VN>          Version to validate. Defaults to BITCODE_SPEC.txt. Supported: V21+, V20_PROPER.',
      '  --mode <draft|promoted> Validation mode. Defaults to draft.',
      '  --current-target <VN>   Expected `Current canonical/latest target` line. Defaults to BITCODE_SPEC.txt in draft mode and the version in promoted mode.',
      '  --repo-root <path>      Override repo root for fixture testing.',
      '  --skip-pointer-check    Skip BITCODE_SPEC.txt equality checking.',
      '  --help                  Show this help.'
    ].join('\n')
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const resolvedRepoRoot = path.resolve(args.repoRoot || process.cwd());
  const version = args.version || readFileSync(path.join(resolvedRepoRoot, 'BITCODE_SPEC.txt'), 'utf8').trim();
  const mode = args.mode || 'draft';
  if (!['draft', 'promoted'].includes(mode)) {
    throw new Error(`Unsupported mode ${mode}. Expected draft or promoted.`);
  }

  const report = buildV21SpecFamilyReport({
    version,
    mode: /** @type {'draft' | 'promoted'} */ (mode),
    ...(args.currentTarget ? { currentTarget: args.currentTarget } : {}),
    ...(args.repoRoot ? { repoRoot: args.repoRoot } : {}),
    ...(args.skipPointerCheck ? { skipPointerCheck: true } : {})
  });

  if (!report.passed) {
    process.stderr.write(`${projectLabel(report.checkedVersion)} spec family check failed for ${report.checkedVersion} (${report.mode})\n`);
    for (const failure of report.failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    [
      `${projectLabel(report.checkedVersion)} spec family ok for ${report.checkedVersion}`,
      `mode=${report.mode}`,
      `currentTarget=${report.currentTarget}`,
      `pointer=${report.pointerVersion}`,
      `files=${report.requiredFiles.length}`
    ].join(' ')
  );
  process.stdout.write('\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
