/**
 * Materialize in-box host runners into containers/images/pipeliner/dist for the
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
 * /opt/bitcode/.proofs/pipeline-host/ (see IMAGE_LAYOUT.txt).
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mode = (process.env.BITCODE_PIPELINE_HOST_MODE || 'host_smoke').trim();
const monorepoRoot = (process.env.BITCODE_MONOREPO_ROOT || '/opt/bitcode').trim();

// Prefer sandbox-uploaded runners (hot-fixed by host plan), then image-baked.
const sandboxRunnerDir = '/vercel/sandbox/.proofs/pipeline-host';
const imageRunnerDir = path.join(monorepoRoot, '.proofs', 'pipeline-host');
const localRunnerDir = __dirname;

async function resolveRunner(name) {
  const candidates = [
    path.join(sandboxRunnerDir, name),
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

  const hostsTsconfig = path.join(
    monorepoRoot,
    'packages/pipeline-hosts/tsconfig.json',
  );
  const hostsPkg = path.join(monorepoRoot, 'packages/pipeline-hosts');
  const outAbs = path.resolve(distDir);
  // shell:true so PATH resolves pnpm when invoked under pnpm recursive run.
  const result = spawnSync(
    `pnpm exec ts-node --transpile-only --project ${JSON.stringify(hostsTsconfig)} src/dev/materialize-runners.ts ${JSON.stringify(outAbs)}`,
    {
      cwd: hostsPkg,
      encoding: 'utf8',
      env: process.env,
      shell: true,
    },
  );
  if (result.error || result.status !== 0) {
    throw new Error(
      `materialize-runners failed (status ${result.status}, error=${result.error?.message || 'none'}): ${result.stderr || result.stdout}`,
    );
  }

  await access(path.join(distDir, 'run-host-smoke.mjs'));
  await access(path.join(distDir, 'run-live-asset-pack-pipeline.mjs'));
  await writeFile(path.join(distDir, 'run-pipeline.mjs'), buildDispatcherSource(), 'utf8');

  await writeFile(
    path.join(distDir, 'IMAGE_LAYOUT.txt'),
    [
      'Monorepo root in image: /opt/bitcode',
      'Copy dist runners to: /opt/bitcode/.proofs/pipeline-host/',
      '  (so live runner ../../packages/* resolves)',
      'Dispatcher: /opt/bitcode/pipeline/run-pipeline.mjs',
      'Customer workspace: /vercel/sandbox (git source)',
      'Manifest/artifacts: /vercel/sandbox/.proofs/pipeline-host/',
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
