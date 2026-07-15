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
const DISALLOWED_DEMONSTRATION_BOUNDARY_PATTERNS = [
  /@bitcode\/protocol-demonstration/,
  /protocol-demonstration\/public/,
  /BITCODE_DEMONSTRATION_PUBLIC_DIR/,
  // Removed product surface — do not reintroduce (Vercel 250mb function bombs).
  /bitcoin-demonstration-service/,
  /getBitcoinDemonstrationService\s*\(/,
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

  it('keeps commercial runtime source free of standalone demonstration imports', () => {
    const violations = COMMERCIAL_SOURCE_ROOTS.flatMap((rootName) =>
      collectSourceFiles(path.join(uapiRoot, rootName)).flatMap((filePath) => {
        const source = readFileSync(filePath, 'utf8');
        return DISALLOWED_DEMONSTRATION_BOUNDARY_PATTERNS
          .filter((pattern) => pattern.test(source))
          .map((pattern) => `${path.relative(repoRoot, filePath)} matched ${pattern}`);
      }),
    );

    expect(violations).toEqual([]);
  });

  it('does not ship a bitcoin-demonstration-service product API route', () => {
    expect(
      existsSync(path.join(uapiRoot, 'app/api/bitcoin-demonstration-service')),
    ).toBe(false);
  });

  it('depends on the formal protocol package instead of the standalone demonstration package', () => {
    const uapiPackageJson = JSON.parse(readFileSync(path.join(uapiRoot, 'package.json'), 'utf8'));
    const dependencies = {
      ...(uapiPackageJson.dependencies ?? {}),
      ...(uapiPackageJson.devDependencies ?? {}),
    };

    expect(dependencies['@bitcode/specifying']).toBe('workspace:*');
    expect(dependencies['@bitcode/protocol-demonstration']).toBeUndefined();
  });

  it('teaches Next webpack how to resolve the formal protocol package during Vercel builds', () => {
    const nextConfigSource = readFileSync(path.join(uapiRoot, 'next.config.mjs'), 'utf8');

    expect(nextConfigSource).toContain("'@bitcode/specifying',");
    expect(nextConfigSource).toContain("'@bitcode/specifying': path.resolve(__dirname, '..', '..', 'scripts', 'specifying', 'src', 'index.js')");
    expect(nextConfigSource).toContain("'@bitcode/specifying$': path.resolve(__dirname, '..', '..', 'scripts', 'specifying', 'src', 'index.js')");
  });

  it('keeps the standalone protocol demonstration outside the workspace build graph', () => {
    const workspaceSource = readFileSync(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');

    expect(workspaceSource).not.toContain("- 'protocol-demonstration'");
  });
});
