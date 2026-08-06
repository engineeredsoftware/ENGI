#!/usr/bin/env node

import { buildCanonPostureDriftReport } from '../scripts/specifying/src/index.js';

function projectLabel(version) {
  const numeric = Number(String(version || '').replace(/^V/u, ''));
  return Number.isInteger(numeric) && numeric >= 25 ? 'Bitcode' : 'ENGI';
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{ activeCanon?: string, draftTarget?: string, repoRoot?: string, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--active-canon') args.activeCanon = argv[++index];
    else if (arg === '--draft-target') args.draftTarget = argv[++index];
    else if (arg === '--repo-root') args.repoRoot = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-bitcode-canon-posture-drift.mjs [options]',
      '',
      'Options:',
      '  --active-canon <VN>   Expected active canonical version. Defaults to current canon-posture source.',
      '  --draft-target <VN>   Expected next draft target version. Defaults to current canon-posture source.',
      '  --repo-root <path>    Override repo root for fixture testing.',
      '  --help                Show this help.'
    ].join('\n')
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const reportVersion = args.activeCanon || args.draftTarget || 'V22';
  const report = buildCanonPostureDriftReport({
    version: reportVersion,
    ...(args.activeCanon ? { activeCanonVersion: args.activeCanon } : {}),
    ...(args.draftTarget ? { draftTargetVersion: args.draftTarget } : {}),
    ...(args.repoRoot ? { repoRoot: args.repoRoot } : {})
  });

  if (!report.passed) {
    process.stderr.write(
      `${projectLabel(report.checkedActiveCanonVersion)} canon posture drift check failed for active=${report.checkedActiveCanonVersion} draft=${report.checkedDraftTargetVersion}\n`
    );
    for (const failure of report.blockingFailures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    [
      `${projectLabel(report.checkedActiveCanonVersion)} canon posture drift ok`,
      `active=${report.checkedActiveCanonVersion}`,
      `draft=${report.checkedDraftTargetVersion}`,
      `checks=${report.checkCount}`
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
