import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

// tests/ → apps/uapi → apps → monorepo root
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const uapiRoot = path.join(repoRoot, 'apps/uapi');

const COMMERCIAL_SOURCE_ROOTS = [
  'app',
  'components',
  'config',
  'hooks',
  'lib',
  'networking',
  'types',
] as const;

const SOURCE_EXTENSIONS = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
/** Patterns that must never reappear in commercial product runtime. */
const DISALLOWED_COMMERCIAL_BOUNDARY_PATTERNS = [
  // Specifying is repo metadevelopment only — never product Next/Vercel runtime.
  /@bitcode\/specifying/,
  /from ['"]@bitcode\/specifying/,
  // Removed host residue — do not reintroduce.
  /bitcode-app-context/,
  /getBitcodeAppContext/,
  /BITCODE_DEMONSTRATION_PUBLIC_DIR/,
  /bitcoin-demonstration-service/,
  /getBitcoinDemonstrationService\s*\(/,
  /DemonstrationWitnessRuntime/,
  /mountBitcodeDemonstrationShell/,
];

function collectSourceFiles(root: string): string[] {
  const entries = readdirSync(root);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(root, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'tmp' || entry === 'coverage' || entry === 'dist') continue;
      files.push(...collectSourceFiles(absolutePath));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry))) {
      files.push(absolutePath);
    }
  }

  return files;
}

describe('commercial protocol boundary', () => {
  it('keeps formal protocol runtime sources present and unignored for deployment clones', () => {
    const requiredRuntimeFiles = [
      'scripts/specifying/package.json',
      'scripts/specifying/server.js',
      'scripts/specifying/src/index.js',
      'scripts/specifying/src/bitcode-runtime.js',
      'scripts/specifying/src/canon-posture.js',
      'scripts/specifying/src/canonical/v23-bitcoin-demonstration-service.js',
      'scripts/specifying/src/canonical/v24-external-realization.js',
      'scripts/specifying/src/canonical/v24-live-execution.js',
      'scripts/specifying/src/canonical/v24-local-executors.js',
    ];

    const missingFiles = requiredRuntimeFiles.filter((filePath) => !existsSync(path.join(repoRoot, filePath)));
    const ignoredFiles = requiredRuntimeFiles.filter((filePath) => {
      try {
        execFileSync('git', ['check-ignore', filePath], { cwd: repoRoot, stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
    const untrackedFiles = existsSync(path.join(repoRoot, '.git'))
      ? requiredRuntimeFiles.filter((filePath) => {
          try {
            execFileSync('git', ['ls-files', '--error-unmatch', filePath], { cwd: repoRoot, stdio: 'ignore' });
            return false;
          } catch {
            return true;
          }
        })
      : [];

    expect(missingFiles).toEqual([]);
    expect(ignoredFiles).toEqual([]);
    expect(untrackedFiles).toEqual([]);
  });

  it('keeps commercial runtime free of specifying and removed host residue', () => {
    const violations = COMMERCIAL_SOURCE_ROOTS.flatMap((rootName) =>
      collectSourceFiles(path.join(uapiRoot, rootName)).flatMap((filePath) => {
        const source = readFileSync(filePath, 'utf8');
        return DISALLOWED_COMMERCIAL_BOUNDARY_PATTERNS
          .filter((pattern) => pattern.test(source))
          .map((pattern) => `${path.relative(repoRoot, filePath)} matched ${pattern}`);
      }),
    );

    expect(violations).toEqual([]);
  });

  it('does not ship removed specifying host shim API routes', () => {
    const removedShimRoutes = [
      'app/api/state',
      'app/api/reset',
      'app/api/deposits',
      'app/api/external-realization',
      'app/api/make-bitcode-branch',
      'app/api/executors',
      'lib/bitcode-app-context.ts',
      'lib/bitcode-app-context-options.ts',
    ];

    for (const relativePath of removedShimRoutes) {
      expect(existsSync(path.join(uapiRoot, relativePath))).toBe(false);
    }

    // Product deposit surface remains under /api/deposit/* (singular).
    expect(existsSync(path.join(uapiRoot, 'app/api/deposit'))).toBe(true);
  });

  it('does not depend on specifying in the commercial package graph', () => {
    const uapiPackageJson = JSON.parse(readFileSync(path.join(uapiRoot, 'package.json'), 'utf8'));
    const dependencies = {
      ...(uapiPackageJson.dependencies ?? {}),
      ...(uapiPackageJson.devDependencies ?? {}),
    };

    // Specifying stays in the monorepo for gates/canon work; it must not be a
    // product dependency (Vercel NFT packs monorepo walks past 250 MB).
    expect(dependencies['@bitcode/specifying']).toBeUndefined();
  });

  it('keeps Next/Vercel product config free of specifying transpile and webpack aliases', () => {
    const nextConfigSource = readFileSync(path.join(uapiRoot, 'next.config.mjs'), 'utf8');

    expect(nextConfigSource).not.toMatch(/['"]@bitcode\/specifying['"]/);
    expect(nextConfigSource).not.toContain("scripts', 'specifying'");
    expect(nextConfigSource).toContain('outputFileTracingRoot');
    expect(nextConfigSource).toContain('scripts/specifying/**');
    expect(nextConfigSource).toContain('**/tests/**');
  });
});
