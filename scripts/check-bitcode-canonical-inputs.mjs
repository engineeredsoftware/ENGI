#!/usr/bin/env node

import { buildV21CanonicalInputReport } from '../packages/specifying/src/index.js';

function projectLabel(version) {
  return 'Bitcode';
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{ currentTarget?: string, repoRoot?: string, skipPointerCheck?: boolean, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--current-target') args.currentTarget = argv[++index];
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
      'Usage: node scripts/check-bitcode-canonical-inputs.mjs [options]',
      '',
      'Options:',
      '  --current-target <VN>   Active canonical target to validate. Defaults to BITCODE_SPEC.txt.',
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

  const report = buildV21CanonicalInputReport({
    ...(args.currentTarget ? { currentTarget: args.currentTarget } : {}),
    ...(args.repoRoot ? { repoRoot: args.repoRoot } : {}),
    ...(args.skipPointerCheck ? { skipPointerCheck: true } : {})
  });

  if (!report.passed) {
    process.stderr.write(`${projectLabel(report.checkedTargetVersion)} canonical input check failed for ${report.checkedTargetVersion}\n`);
    for (const failure of report.failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    [
      `${projectLabel(report.checkedTargetVersion)} canonical inputs ok for ${report.checkedTargetVersion}`,
      `pointer=${report.pointerVersion}`,
      `parity=${report.parityPath}`,
      `artifacts=${report.requiredGeneratedArtifactCount}`
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
