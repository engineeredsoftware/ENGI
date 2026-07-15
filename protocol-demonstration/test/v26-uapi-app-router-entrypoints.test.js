import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const UAPI_APP_ROOT = path.join(REPO_ROOT, 'apps/uapi/app');
const APP_ROUTER_ENTRYPOINT_NAMES = new Set([
  'page',
  'route',
  'layout',
  'error',
  'head',
  'loading',
  'template',
  'default',
  'not-found',
]);

function collectJavaScriptAppRouterEntrypoints(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectJavaScriptAppRouterEntrypoints(absolutePath, files);
      continue;
    }

    const match = entry.name.match(/^(.*)\.(js|jsx)$/);
    if (!match) continue;
    if (!APP_ROUTER_ENTRYPOINT_NAMES.has(match[1])) continue;

    files.push(path.relative(REPO_ROOT, absolutePath));
  }

  return files;
}

function collectJavaScriptMirrorFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectJavaScriptMirrorFiles(absolutePath, files);
      continue;
    }

    if (!entry.name.match(/\.(js|jsx)$/)) continue;

    const typescriptTwin = absolutePath.replace(/\.(js|jsx)$/, '.ts');
    const tsxTwin = absolutePath.replace(/\.(js|jsx)$/, '.tsx');
    if (!existsSync(typescriptTwin) && !existsSync(tsxTwin)) continue;

    files.push(path.relative(REPO_ROOT, absolutePath));
  }

  return files;
}

test('V26 keeps active uapi app-owned source TypeScript-only', () => {
  const javascriptEntrypoints = collectJavaScriptAppRouterEntrypoints(UAPI_APP_ROOT);
  const javascriptMirrors = collectJavaScriptMirrorFiles(UAPI_APP_ROOT);

  assert.deepEqual(
    javascriptEntrypoints,
    [],
    `expected no JavaScript App Router entrypoints under apps/uapi/app, found:\n${javascriptEntrypoints.join('\n')}`,
  );

  assert.deepEqual(
    javascriptMirrors,
    [],
    `expected no JavaScript mirror files with TypeScript peers under apps/uapi/app, found:\n${javascriptMirrors.join('\n')}`,
  );
});
