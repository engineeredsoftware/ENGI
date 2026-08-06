import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const distDir = path.join(packageRoot, 'dist');

test('materialize writes dispatcher and runners', async () => {
  const result = spawnSync('node', [path.join(__dirname, 'materialize.mjs')], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: process.env,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  await access(path.join(distDir, 'run-pipeline.mjs'));
  await access(path.join(distDir, 'run-host-smoke.mjs'));
  await access(path.join(distDir, 'run-live-asset-pack-pipeline.mjs'));

  const dispatcher = await readFile(path.join(distDir, 'run-pipeline.mjs'), 'utf8');
  assert.match(dispatcher, /BITCODE_PIPELINE_HOST_MODE/);
  assert.match(dispatcher, /run-live-asset-pack-pipeline/);
});
