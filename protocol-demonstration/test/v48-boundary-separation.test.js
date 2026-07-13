/**
 * Living V48 demonstration witness (complete modern-canon suite only).
 * Not a rewrite of frozen V28-era files — those remain under test/v28-* and test:v28-mvp-qa.
 */

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const demonstrationRoot = path.join(repoRoot, 'protocol-demonstration');
const importBoundaryPattern = /(?:import\s+(?:[^'"]+\s+from\s+)?|import\s*\(|require\s*\()\s*['"][^'"]*(?:\.\.\/\.\.\/packages\/|\.\.\/\.\.\/uapi\/|@bitcode\/)/;

function collectJavaScriptFiles(root) {
  const files = [];

  for (const entry of readdirSync(root)) {
    const absolutePath = path.join(root, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'coverage' || entry === 'dist') continue;
      files.push(...collectJavaScriptFiles(absolutePath));
      continue;
    }

    if (entry.endsWith('.js') || entry.endsWith('.mjs') || entry.endsWith('.cjs')) {
      files.push(absolutePath);
    }
  }

  return files;
}

test('standalone protocol demonstration runtime does not import outside source or workspace packages', () => {
  const runtimeFiles = [
    path.join(demonstrationRoot, 'server.js'),
    ...collectJavaScriptFiles(path.join(demonstrationRoot, 'src')),
  ];
  const violations = runtimeFiles
    .filter((filePath) => importBoundaryPattern.test(readFileSync(filePath, 'utf8')))
    .map((filePath) => path.relative(repoRoot, filePath));

  assert.deepEqual(violations, []);
});

test('standalone protocol demonstration stays outside the workspace build graph', () => {
  const workspaceSource = readFileSync(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');

  assert.equal(workspaceSource.includes("- 'protocol-demonstration'"), false);
});

test('standalone protocol demonstration guards title updates when embedded as a product witness', () => {
  const appBundle = readFileSync(path.join(demonstrationRoot, 'public', 'app.js'), 'utf8');

  assert.match(appBundle, /function shouldUpdateDocumentTitle\(\)/);
  assert.match(appBundle, /data-bitcode-demonstration-witness-host/);
  assert.match(appBundle, /if \(shouldUpdateDocumentTitle\(\)\) \{\s*document\.title =/);
});
