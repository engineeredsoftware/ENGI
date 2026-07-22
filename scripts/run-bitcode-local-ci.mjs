#!/usr/bin/env node

/**
 * Living required local CI mirror (V47 pointer + V48 draft).
 *
 * Mirrors required GitHub surfaces that gate shared-branch work:
 *   - Casing and Import Consistency
 *   - Bitcode Canon Quality (active + draft)
 *   - Bitcode Gate Quality (typecheck, package tests, staged harness)
 *   - CI lint-build + test-mocks
 *
 * Opt-in / infra (not required here, same as default branch protection):
 *   ENABLE_FULL_DB_E2E, CodeQL, Super Linter, Long-Runner ECR,
 *   BITCODE_ENABLE_GATE_BROWSER_PROOF Playwright proofs.
 *
 * Pre-commit (.githooks/pre-commit) runs this with default mode=full and
 * refuses the commit unless every step exits 0.
 *
 * Law: .docs/AGENTS.md (never commit until living CI green),
 * CONTRIBUTING.md §8.1.
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  /** @type {{ mode: string, repoRoot: string, help?: boolean, list?: boolean }} */
  const args = {
    mode: 'full',
    repoRoot: defaultRepoRoot,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--mode') args.mode = String(argv[++index] || 'full');
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--list') args.list = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  if (!['full', 'lint-build'].includes(args.mode)) {
    throw new Error(`Unknown --mode ${args.mode} (use full|lint-build)`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/run-bitcode-local-ci.mjs [options]',
      '',
      'Living local CI mirror for the active + draft surface. Must be green',
      'before every commit (enforced by .githooks/pre-commit).',
      '',
      'Options:',
      '  --mode full         Full living mirror (default; pre-commit uses this)',
      '  --mode lint-build   ESLint plugin + lint + tsc + next build only',
      '  --list              Print steps without running',
      '  --repo-root <path>  Override repo root',
      '  --help              Show this help',
      '',
      'Package scripts:',
      '  pnpm run ci:local',
      '  pnpm run ci:local:lint-build',
      '',
    ].join('\n'),
  );
}

/**
 * @param {string} repoRoot
 * @param {string} label
 * @param {string} command
 * @param {string[]} [args]
 * @param {{ shell?: boolean }} [opts]
 */
function runStep(repoRoot, label, command, args = [], opts = {}) {
  process.stdout.write(`\n======== ${label} ========\n`);
  if (opts.shell) {
    execSync([command, ...args].join(' '), {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
    });
    return;
  }
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

/**
 * @param {string} repoRoot
 * @param {string} label
 * @param {string[]} pnpmArgs
 */
function runPnpm(repoRoot, label, pnpmArgs) {
  runStep(repoRoot, label, 'pnpm', pnpmArgs);
}

/**
 * @param {string} repoRoot
 * @param {string} label
 * @param {string[]} nodeArgs relative script + args
 */
function runNodeScript(repoRoot, label, nodeArgs) {
  runStep(repoRoot, label, process.execPath, nodeArgs);
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
function readPointer(repoRoot) {
  const pointerPath = path.join(repoRoot, '.specifications/BITCODE_SPEC.txt');
  return readFileSync(pointerPath, 'utf8').trim();
}

/**
 * @param {string} repoRoot
 * @param {'full' | 'lint-build'} mode
 * @returns {{ id: string, run: () => void }[]}
 */
export function buildLocalCiSteps(repoRoot, mode) {
  /** @type {{ id: string, run: () => void }[]} */
  const steps = [];

  const add = (id, run) => {
    steps.push({ id, run });
  };

  if (mode === 'lint-build') {
    add('eslint-plugin', () => runPnpm(repoRoot, 'ESLint plugin build', ['run', 'build:eslint-plugin']));
    add('uapi-lint', () => runPnpm(repoRoot, 'uapi ESLint', ['-C', 'apps/uapi', 'run', 'lint']));
    add('uapi-tsc', () =>
      runPnpm(repoRoot, 'uapi TypeScript', ['-C', 'apps/uapi', 'exec', 'tsc', '--noEmit']),
    );
    add('uapi-build', () => runPnpm(repoRoot, 'uapi Next build', ['-C', 'apps/uapi', 'run', 'build']));
    return steps;
  }

  // --- full living mirror ---

  add('casing-raw-promptparts', () =>
    runStep(repoRoot, 'Casing: raw_promptparts', 'bash', [
      'scripts/find-uppercase-raw-promptparts.sh',
    ]),
  );
  add('casing-imports', () =>
    runStep(repoRoot, 'Casing: import mismatches', 'bash', ['scripts/check-import-casing.sh']),
  );

  add('canon-v47-family', () =>
    runNodeScript(repoRoot, 'Canon: V47 promoted family', [
      'scripts/check-bitcode-spec-family.mjs',
      '--version',
      'V47',
      '--mode',
      'promoted',
      '--current-target',
      'V47',
    ]),
  );
  add('canon-v47-inputs', () =>
    runNodeScript(repoRoot, 'Canon: V47 canonical inputs', [
      'scripts/check-bitcode-canonical-inputs.mjs',
      '--current-target',
      'V47',
    ]),
  );
  add('canon-posture', () =>
    runNodeScript(repoRoot, 'Canon: V47→V48 posture drift', [
      'scripts/check-bitcode-canon-posture-drift.mjs',
      '--active-canon',
      'V47',
      '--draft-target',
      'V48',
    ]),
  );
  add('canon-v47-gate10', () =>
    runNodeScript(repoRoot, 'Canon: V47 gate10 promotion readiness', [
      'scripts/check-v47-gate10-promotion-readiness.mjs',
      '--promotion-mode',
      '--skip-branch-check',
      '--skip-package-tests',
    ]),
  );
  if (existsSync(path.join(repoRoot, '.specifications/BITCODE_SPEC_V48.md'))) {
    add('canon-v48-draft-family', () =>
      runNodeScript(repoRoot, 'Canon: V48 draft family', [
        'scripts/check-bitcode-spec-family.mjs',
        '--version',
        'V48',
        '--mode',
        'draft',
        '--current-target',
        'V47',
      ]),
    );
  }

  add('gate-typecheck-btd', () =>
    runPnpm(repoRoot, 'Gate typecheck: @bitcode/btd', ['--filter', '@bitcode/btd', 'typecheck']),
  );
  add('gate-typecheck-api', () =>
    runPnpm(repoRoot, 'Gate typecheck: @bitcode/api build', ['--filter', '@bitcode/api', 'build']),
  );
  add('gate-typecheck-mcp-generics', () =>
    runPnpm(repoRoot, 'Gate typecheck: @bitcode/mcp-generics', [
      '--filter',
      '@bitcode/mcp-generics',
      'typecheck',
    ]),
  );
  add('gate-typecheck-chatgpt', () =>
    runPnpm(repoRoot, 'Gate typecheck: apps/chatgpt', [
      '--dir',
      'apps/chatgpt',
      'exec',
      'tsc',
      '--noEmit',
      '--pretty',
      'false',
    ]),
  );
  add('gate-typecheck-domain', () =>
    runPnpm(repoRoot, 'Gate typecheck: asset-packs-pipelines-domain', [
      '--filter',
      '@bitcode/asset-packs-pipelines-domain',
      'typecheck',
    ]),
  );
  add('gate-typecheck-pipeline-hosts', () =>
    runPnpm(repoRoot, 'Gate typecheck: pipeline-hosts', [
      '--filter',
      '@bitcode/pipeline-hosts',
      'typecheck',
    ]),
  );
  add('gate-typecheck-specifying', () =>
    runPnpm(repoRoot, 'Gate typecheck: specifying', [
      '--filter',
      '@bitcode/specifying',
      'typecheck',
    ]),
  );

  /** @type {{ id: string, paths: string[], optional?: boolean }[]} */
  const btdSuites = [
    { id: 'btd-btc-fee', paths: ['__tests__/btc-fee-operation.test.ts'] },
    { id: 'btd-core', paths: ['__tests__/btd.test.ts'] },
    {
      id: 'btd-traceability',
      paths: ['__tests__/asset-pack-economic-traceability.test.ts'],
      optional: true,
    },
    { id: 'btd-v32-ledger', paths: ['__tests__/v32-ledger-btd-settlement-failure-states.test.ts'] },
    {
      id: 'btd-shares-recon',
      paths: ['__tests__/source-to-shares.test.ts', '__tests__/reconciliation.test.ts'],
    },
    {
      id: 'btd-v32-iface-regression',
      paths: ['__tests__/v32-interface-contract-regression.test.ts'],
    },
    { id: 'btd-iface-catalog', paths: ['__tests__/interface-contract-catalog.test.ts'] },
    { id: 'btd-mcp-tool', paths: ['__tests__/mcp-tool-contract.test.ts'] },
    { id: 'btd-chatgpt-action', paths: ['__tests__/chatgpt-app-action-contract.test.ts'] },
    { id: 'btd-iface-auth', paths: ['__tests__/interface-authorization-policy.test.ts'] },
    {
      id: 'btd-read-license',
      paths: ['__tests__/read-license-assetpack-rights-contract.test.ts'],
    },
    { id: 'btd-api-schema', paths: ['__tests__/api-schema-compatibility-matrix.test.ts'] },
    { id: 'btd-iface-telemetry', paths: ['__tests__/interface-telemetry-proof-hook.test.ts'] },
    { id: 'btd-iface-ux', paths: ['__tests__/interface-consumer-ux-regression-proof.test.ts'] },
    { id: 'btd-deploy-host', paths: ['__tests__/deployment-host-capability-catalog.test.ts'] },
    { id: 'btd-deploy-storage', paths: ['__tests__/deployment-storage-posture.test.ts'] },
    { id: 'btd-secret-rotation', paths: ['__tests__/secret-rotation-plan.test.ts'] },
    { id: 'btd-migration-gate', paths: ['__tests__/migration-approval-gate.test.ts'] },
    { id: 'btd-runtime-observer', paths: ['__tests__/runtime-observer-repair-job.test.ts'] },
    { id: 'btd-rollback', paths: ['__tests__/rollback-upgrade-repair-playbook.test.ts'] },
    { id: 'btd-deploy-rehearsal', paths: ['__tests__/deployment-readiness-rehearsal.test.ts'] },
    {
      id: 'btd-deploy-promotion',
      paths: ['__tests__/deployment-promotion-readiness-report.test.ts'],
    },
    {
      id: 'btd-v32-testnet',
      paths: ['__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts'],
    },
  ];

  for (const suite of btdSuites) {
    const packageRoot = path.join(repoRoot, 'packages/btd');
    const missing = suite.paths.some((p) => !existsSync(path.join(packageRoot, p)));
    if (missing && suite.optional) continue;
    add(`gate-test-${suite.id}`, () =>
      runPnpm(repoRoot, `Gate test: ${suite.id}`, [
        '--filter',
        '@bitcode/btd',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        ...suite.paths,
        '--runInBand',
        '--forceExit',
      ]),
    );
  }

  add('gate-test-specifying', () =>
    runPnpm(repoRoot, 'Gate test: @bitcode/specifying', ['--filter', '@bitcode/specifying', 'test']),
  );

  add('gate-test-api-btd-crypto', () =>
    runPnpm(repoRoot, 'Gate test: api btd-crypto', [
      '--filter',
      '@bitcode/api',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/routes/__tests__/btd-crypto.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-api-auxillaries', () =>
    runPnpm(repoRoot, 'Gate test: api auxillaries-contract', [
      '--filter',
      '@bitcode/api',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/routes/__tests__/auxillaries-contract.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );

  add('gate-test-mcp-auth', () =>
    runPnpm(repoRoot, 'Gate test: generic-mcps auth', [
      '--filter',
      '@bitcode/generic-mcps-bitcode',
      'run',
      'test:mcp',
      '--',
      '--runTestsByPath',
      'src/__tests__/unit/auth.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-mcp-contracts', () =>
    runPnpm(repoRoot, 'Gate test: generic-mcps contracts', [
      '--filter',
      '@bitcode/generic-mcps-bitcode',
      'run',
      'test:mcp',
      '--',
      '--runTestsByPath',
      'src/__tests__/unit/mcp-tool-contract.test.ts',
      'src/__tests__/unit/pipeline-ingress-contract.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );

  add('gate-test-chatgpt', () =>
    runPnpm(repoRoot, 'Gate test: apps/chatgpt', [
      '--dir',
      'apps/chatgpt',
      'exec',
      'jest',
      '--runTestsByPath',
      'src/__tests__/chatgpt-action-contract.test.ts',
      'src/__tests__/tools.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );

  add('gate-test-pipeline-hosts-plan', () =>
    runPnpm(repoRoot, 'Gate test: pipeline-hosts plan', [
      '--filter',
      '@bitcode/pipeline-hosts',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/asset-pack-host-plan.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-pipeline-hosts-receipt', () =>
    runPnpm(repoRoot, 'Gate test: pipeline-hosts receipt', [
      '--filter',
      '@bitcode/pipeline-hosts',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/distributed-execution-runtime-receipt.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );

  const readingFilter =
    '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs';
  add('gate-test-reading-pipeline', () =>
    runPnpm(repoRoot, 'Gate test: reading pipeline suite', [
      '--filter',
      readingFilter,
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/reading-pipeline-integration-coverage.test.ts',
      'src/__tests__/reading-pipeline-observability.test.ts',
      'src/__tests__/reading-pipeline-contract.test.ts',
      'src/__tests__/v32-reading-pipeline-proof-coverage.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-asset-pack-disclosure', () =>
    runPnpm(repoRoot, 'Gate test: asset-pack disclosure', [
      '--filter',
      '@bitcode/asset-packs-pipelines-domain',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/asset-pack-disclosure.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-postprocess', () =>
    runPnpm(repoRoot, 'Gate test: syntheses-domain postprocess', [
      '--filter',
      '@bitcode/asset-packs-pipelines-syntheses-domain',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/postprocess.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-read-need', () =>
    runPnpm(repoRoot, 'Gate test: read-need', [
      '--filter',
      readingFilter,
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/read-need.test.ts',
      'src/__tests__/read-need-review-resynthesis.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-asset-pack-preview', () =>
    runPnpm(repoRoot, 'Gate test: asset-pack preview boundary', [
      '--filter',
      '@bitcode/asset-packs-pipelines-syntheses-domain',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/asset-pack-preview-boundary.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-settlement-rights', () =>
    runPnpm(repoRoot, 'Gate test: settlement rights delivery', [
      '--filter',
      '@bitcode/asset-packs-pipelines-domain',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-reading-telemetry', () =>
    runPnpm(repoRoot, 'Gate test: reading operational telemetry', [
      '--filter',
      readingFilter,
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/reading-operational-telemetry-repair-readback.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-reading-parity', () =>
    runPnpm(repoRoot, 'Gate test: reading interface product parity', [
      '--filter',
      readingFilter,
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/__tests__/reading-interface-product-parity.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );
  add('gate-test-conversations', () =>
    runPnpm(repoRoot, 'Gate test: api conversations', [
      '--filter',
      '@bitcode/api',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      '--runTestsByPath',
      'src/conversations/__tests__/stream-events.test.ts',
      'src/conversations/__tests__/privacy.test.ts',
      'src/conversations/__tests__/telemetry.test.ts',
      '--runInBand',
      '--forceExit',
    ]),
  );

  const stagedHarness = [
    'tests/userDataRoute.test.ts',
    'tests/auxillariesWalletPane.test.tsx',
    'tests/auxillariesContent.access.test.tsx',
    'tests/auxillariesWorkspacePanels.access.test.tsx',
    'tests/auxillariesWorkspacePanels.test.tsx',
    'tests/api/auxillariesGithubConnectionRoute.test.ts',
    'tests/api/vcsRoutes.test.ts',
    'tests/api/conversationSessionRouteHistory.test.ts',
    'tests/api/conversationSessionRouteHistoryContract.test.ts',
    'tests/api/conversationStreamEventContract.test.ts',
    'tests/conversationStreamPipelineLog.test.tsx',
    'tests/api/conversationPersistencePrivacyRedaction.test.ts',
    'tests/conversationPersistencePrivacyPanel.test.tsx',
    'tests/api/conversationTelemetryProofHooks.test.ts',
    'tests/conversationTelemetryProofPanel.test.tsx',
    'tests/api/conversationRehearsal.test.ts',
    'tests/api/conversationReadingInterfaceParity.test.ts',
    'tests/conversationRehearsalPanel.test.tsx',
    'tests/conversationSourceSelector.test.tsx',
    'tests/conversationWritingWorkspace.test.tsx',
    'tests/auxillariesExternalsPane.test.tsx',
    'tests/profileStep.test.tsx',
    'tests/api/readReviewRoute.test.ts',
    'tests/bitcodeLedgerStorageSync.test.ts',
    'tests/protocolCommercialBoundary.test.ts',
    'tests/bitcodeBrowserProof.test.ts',
    'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
    'tests/readingOperationalTelemetryPipelineLog.test.tsx',
    'tests/pipelineExecutionLogHeader.test.tsx',
  ];
  add('gate-staged-harness', () =>
    runPnpm(repoRoot, 'Gate: staged product harness', [
      '--dir',
      'apps/uapi',
      'exec',
      'jest',
      '--runTestsByPath',
      ...stagedHarness,
      '--runInBand',
    ]),
  );

  add('gate-pipeline-readback', () =>
    runPnpm(repoRoot, 'Gate: pipeline readback verifier', ['test:qa:v28:pipeline-readback']),
  );
  add('gate-specifying-boundary', () =>
    runPnpm(repoRoot, 'Gate: specifying package boundary', [
      '--dir',
      'scripts/specifying',
      'exec',
      'node',
      '--test',
      '--test-force-exit',
      'test/specifying-package-boundary.test.js',
    ]),
  );
  add('diff-hygiene', () => runStep(repoRoot, 'Diff hygiene', 'git', ['diff', '--check']));

  add('eslint-plugin', () => runPnpm(repoRoot, 'CI: ESLint plugin build', ['run', 'build:eslint-plugin']));
  add('uapi-lint', () => runPnpm(repoRoot, 'CI: uapi ESLint', ['-C', 'apps/uapi', 'run', 'lint']));
  add('uapi-tsc', () =>
    runPnpm(repoRoot, 'CI: uapi TypeScript', ['-C', 'apps/uapi', 'exec', 'tsc', '--noEmit']),
  );
  add('uapi-build', () => runPnpm(repoRoot, 'CI: uapi Next build', ['-C', 'apps/uapi', 'run', 'build']));
  add('uapi-jest-mocks', () =>
    runPnpm(repoRoot, 'CI: uapi Jest mocks + coverage', [
      '-C',
      'apps/uapi',
      'exec',
      'jest',
      '--coverage',
      '--runInBand',
    ]),
  );

  return steps;
}

/**
 * @param {{ mode: string, repoRoot: string, list?: boolean }} options
 */
export function runLocalCi(options) {
  const { mode, repoRoot, list } = options;
  const pointer = readPointer(repoRoot);
  if (mode === 'full' && pointer !== 'V47') {
    throw new Error(
      `run-bitcode-local-ci full mode is wired for the living V47 pointer + V48 draft path; observed pointer=${pointer || 'empty'}. Update scripts/run-bitcode-local-ci.mjs when the active pointer advances.`,
    );
  }

  const steps = buildLocalCiSteps(repoRoot, /** @type {'full' | 'lint-build'} */ (mode));
  process.stdout.write(
    `Bitcode local CI: mode=${mode} pointer=${pointer} steps=${steps.length}\n`,
  );

  if (list) {
    for (const step of steps) process.stdout.write(`- ${step.id}\n`);
    return;
  }

  const started = Date.now();
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    process.stdout.write(`[${i + 1}/${steps.length}] ${step.id}\n`);
    step.run();
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  process.stdout.write(
    `\nBitcode local CI GREEN (mode=${mode}, ${steps.length} steps, ${seconds}s)\n`,
  );
  process.stdout.write(
    'Skipped (opt-in/infra): ENABLE_FULL_DB_E2E, CodeQL, Super Linter, Long-Runner ECR, gate browser-proof Playwright\n',
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  runLocalCi(args);
}

try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
  }
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Bitcode local CI FAILED: ${detail}\n`);
  process.exitCode = 1;
}
