import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const V44_SPEC_FAMILY_FILES = [
  'BITCODE_SPEC.txt',
  'BITCODE_SPECIFYING.md',
  'BITCODE_SPEC_TEMPLATEGUIDE.md',
  'BITCODE_SPEC_V44.md',
  'BITCODE_SPEC_V44_DELTA.md',
  'BITCODE_SPEC_V44_NOTES.md',
  'BITCODE_SPEC_V44_PARITY_MATRIX.md',
];

const V45_SPEC_FAMILY_FILES = [
  'BITCODE_SPEC.txt',
  'BITCODE_SPECIFYING.md',
  'BITCODE_SPEC_TEMPLATEGUIDE.md',
  'BITCODE_SPEC_V45.md',
  'BITCODE_SPEC_V45_DELTA.md',
  'BITCODE_SPEC_V45_NOTES.md',
  'BITCODE_SPEC_V45_PARITY_MATRIX.md',
];

const V46_SPEC_FAMILY_FILES = [
  'BITCODE_SPEC.txt',
  'BITCODE_SPECIFYING.md',
  'BITCODE_SPEC_TEMPLATEGUIDE.md',
  'BITCODE_SPEC_V46.md',
  'BITCODE_SPEC_V46_DELTA.md',
  'BITCODE_SPEC_V46_NOTES.md',
  'BITCODE_SPEC_V46_PARITY_MATRIX.md',
];

test('promoted spec-family validation rejects stale draft source-of-truth prose', async () => {
  const protocol = await import('../src/index.js');
  const tempDir = mkdtempSync(path.join(tmpdir(), 'bitcode-promoted-spec-posture-'));

  try {
    for (const relativePath of V44_SPEC_FAMILY_FILES) {
      copyFileSync(path.join(repoRoot, relativePath), path.join(tempDir, relativePath));
    }

    const specPath = path.join(tempDir, 'BITCODE_SPEC_V44.md');
    const spec = readFileSync(specPath, 'utf8');
    const staleSpec = spec.replace(
      /## V44 source-of-truth hierarchy[\s\S]*?## V44 promotion addendum: canonical posture repair/u,
      [
        '## V44 source-of-truth hierarchy',
        '',
        '`BITCODE_SPEC.txt` points to `V43` while V44 is draft.',
        '`BITCODE_SPEC_V43.md` and `BITCODE_SPEC_V43_PROVEN.md` are active canon.',
        '`BITCODE_SPEC_V44.md`, `BITCODE_SPEC_V44_DELTA.md`,',
        '`BITCODE_SPEC_V44_NOTES.md`, and `BITCODE_SPEC_V44_PARITY_MATRIX.md` define',
        'the draft target only on `version/v44` and `v44/gate-*` branches.',
        '',
        '## V44 promotion addendum: canonical posture repair',
      ].join('\n')
    );

    writeFileSync(specPath, staleSpec);

    const report = protocol.buildV21SpecFamilyReport({
      repoRoot: tempDir,
      version: 'V44',
      mode: 'promoted',
      currentTarget: 'V44',
    });

    assert.equal(report.passed, false);
    assert.ok(
      report.failures.some((failure) => failure.includes('promoted source-of-truth hierarchy')),
      `expected promoted source-of-truth failure, got: ${report.failures.join('; ')}`
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('V46 promotion preparation rewrites draft posture before promoted validation', async () => {
  const protocol = await import('../src/index.js');
  const tempDir = mkdtempSync(path.join(tmpdir(), 'bitcode-promoted-spec-posture-'));

  try {
    for (const relativePath of V46_SPEC_FAMILY_FILES) {
      copyFileSync(path.join(repoRoot, relativePath), path.join(tempDir, relativePath));
    }

    writeFileSync(path.join(tempDir, 'BITCODE_SPEC.txt'), 'V46\n');

    execFileSync(
      process.execPath,
      [
        path.join(repoRoot, 'scripts/prepare-bitcode-spec-family-promotion.mjs'),
        '--version',
        'V46',
        '--commit',
        '0123456789abcdef0123456789abcdef01234567',
        '--repo-root',
        tempDir,
      ],
      { stdio: 'pipe' }
    );

    const report = protocol.buildV21SpecFamilyReport({
      repoRoot: tempDir,
      version: 'V46',
      mode: 'promoted',
      currentTarget: 'V46',
    });

    assert.equal(report.passed, true, report.failures.join('; '));
    assert.match(
      readFileSync(path.join(tempDir, 'BITCODE_SPEC_V46.md'), 'utf8'),
      /`BITCODE_SPEC\.txt` points to `V46`; V46 is the active promoted Bitcode canon\./u
    );
    assert.match(
      readFileSync(path.join(tempDir, 'BITCODE_SPEC_V46_NOTES.md'), 'utf8'),
      /Canonical pointer: `BITCODE_SPEC\.txt` -> `V46`/u
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('promoted spec-family validation rejects stale draft posture outside source-of-truth prose', async () => {
  const protocol = await import('../src/index.js');
  const tempDir = mkdtempSync(path.join(tmpdir(), 'bitcode-promoted-spec-posture-'));

  try {
    for (const relativePath of V45_SPEC_FAMILY_FILES) {
      copyFileSync(path.join(repoRoot, relativePath), path.join(tempDir, relativePath));
    }

    writeFileSync(path.join(tempDir, 'BITCODE_SPEC.txt'), 'V45\n');

    const notesPath = path.join(tempDir, 'BITCODE_SPEC_V45_NOTES.md');
    const notes = readFileSync(notesPath, 'utf8');
    writeFileSync(
      notesPath,
      `${notes}\n\nStale regression fixture: V45 draft work does not replace the active canon.\n`
    );

    const report = protocol.buildV21SpecFamilyReport({
      repoRoot: tempDir,
      version: 'V45',
      mode: 'promoted',
      currentTarget: 'V45',
    });

    assert.equal(report.passed, false);
    assert.ok(
      report.failures.some((failure) => failure.includes('stale draft posture phrase "V45 draft work"')),
      `expected promoted stale draft posture failure, got: ${report.failures.join('; ')}`
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
