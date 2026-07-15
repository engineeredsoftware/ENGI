/**
 * Materialize in-box host runners into packages/pipeline-image/dist for the
 * VCR pipeline appliance image and local smoke checks.
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const distDir = path.join(packageRoot, 'dist');
const monorepoRoot = path.resolve(packageRoot, '../..');

function buildDispatcherSource() {
  return `/**
 * Pipeline appliance entry (VCR / Sandbox image).
 * Env:
 *   BITCODE_PIPELINE_HOST_MODE=host_smoke|asset_pack_pipeline
 *   BITCODE_PIPELINE_HOST_MANIFEST
 *   BITCODE_PIPELINE_HOST_ARTIFACT_DIR
 *   BITCODE_MONOREPO_ROOT (default /opt/bitcode)
 *
 * Live runners resolve monorepo packages via ../../packages from
 * /opt/bitcode/.bitcode/pipeline-host/ (see IMAGE_LAYOUT.txt).
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mode = (process.env.BITCODE_PIPELINE_HOST_MODE || 'host_smoke').trim();
const monorepoRoot = (process.env.BITCODE_MONOREPO_ROOT || '/opt/bitcode').trim();

// Prefer image layout (runners next to monorepo for relative imports).
const imageRunnerDir = path.join(monorepoRoot, '.bitcode', 'pipeline-host');
const localRunnerDir = __dirname;

async function resolveRunner(name) {
  const candidates = [
    path.join(imageRunnerDir, name),
    path.join(localRunnerDir, name),
  ];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(\`Pipeline runner not found: \${name} (searched \${candidates.join(', ')})\`);
}

process.chdir(monorepoRoot);

const runnerName =
  mode === 'asset_pack_pipeline'
    ? 'run-live-asset-pack-pipeline.mjs'
    : 'run-host-smoke.mjs';
const runner = await resolveRunner(runnerName);
await import(pathToFileURL(runner).href);
`;
}

async function main() {
  await mkdir(distDir, { recursive: true });

  const result = spawnSync(
    'pnpm',
    [
      '--filter',
      '@bitcode/pipeline-hosts',
      'exec',
      'ts-node',
      '--transpile-only',
      'src/dev/materialize-runners.ts',
      distDir,
    ],
    {
      cwd: monorepoRoot,
      encoding: 'utf8',
      env: process.env,
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `materialize-runners failed (status ${result.status}): ${result.stderr || result.stdout}`,
    );
  }

  await access(path.join(distDir, 'run-host-smoke.mjs'));
  await access(path.join(distDir, 'run-live-asset-pack-pipeline.mjs'));
  await writeFile(path.join(distDir, 'run-pipeline.mjs'), buildDispatcherSource(), 'utf8');

  await writeFile(
    path.join(distDir, 'IMAGE_LAYOUT.txt'),
    [
      'Monorepo root in image: /opt/bitcode',
      'Copy dist runners to: /opt/bitcode/.bitcode/pipeline-host/',
      '  (so live runner ../../packages/* resolves)',
      'Dispatcher: /opt/bitcode/pipeline/run-pipeline.mjs',
      'Customer workspace: /vercel/sandbox (git source)',
      'Manifest/artifacts: /vercel/sandbox/.bitcode/pipeline-host/',
      '',
    ].join('\n'),
    'utf8',
  );

  console.log(`Materialized pipeline-image runners → ${distDir}`);
  console.log(result.stdout || '');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
