// @ts-check

import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH =
  '.proofs/v43/route-vocabulary-inventory.json';
export const V43_ROUTE_VOCABULARY_INVENTORY_SCHEMA_ID =
  'bitcode.v43.routeVocabularyInventory.v1';
export const V43_ROUTE_VOCABULARY_INVENTORY_VERSION = 'V43';
export const V43_ROUTE_VOCABULARY_INVENTORY_CURRENT_TARGET = 'V42';
export const V43_ROUTE_VOCABULARY_INVENTORY_SOURCE_SAFETY_VERDICT =
  'source-safe-route-vocabulary-inventory-metadata';

export const V43_ROUTE_VOCABULARY_TOKEN_IDS = Object.freeze([
  'route:/exchange',
  'route:/terminal',
  'route:/packs',
  'route:/read',
  'route:/deposit',
  'symbol:Exchange',
  'symbol:product',
  'symbol:Packs',
  'symbol:Reading',
  'symbol:Depositing',
  'symbol:PackActivity',
  'symbol:DepositAssetPackOption',
  'word:exchange',
  'word:terminal',
  'word:self-referential',
]);

export const V43_ROUTE_VOCABULARY_CATEGORY_IDS = Object.freeze([
  'route',
  'component',
  'test',
  'doc',
  'api',
  'telemetry',
  'workflow',
  'script',
  'package',
  'spec',
]);

export const V43_ROUTE_VOCABULARY_MIGRATION_ROW_IDS = Object.freeze([
  'packs-route-master-detail',
  'read-route-five-step-reading',
  'deposit-route-agentic-options',
  'retained-debug-cockpit',
  'redirect-compatibility',
  'self-referential-copy-removal',
]);

const TOKEN_SPECS = Object.freeze([
  ['route:/exchange', /\/exchange(?=$|[/?#"'`\s),\]}])/gu],
  ['route:/terminal', /\/terminal(?=$|[/?#"'`\s),\]}])/gu],
  ['route:/packs', /\/packs(?=$|[/?#"'`\s),\]}])/gu],
  ['route:/read', /\/read(?=$|[/?#"'`\s),\]}])/gu],
  ['route:/deposit', /\/deposit(?=$|[/?#"'`\s),\]}])/gu],
  ['symbol:Exchange', /\bExchange\b/gu],
  ['symbol:product', /\bTerminal\b/gu],
  ['symbol:Packs', /\bPacks\b/gu],
  ['symbol:Reading', /\bReading\b/gu],
  ['symbol:Depositing', /\bDepositing\b/gu],
  ['symbol:PackActivity', /\bPackActivity\b/gu],
  ['symbol:DepositAssetPackOption', /\bDepositAssetPackOption\b/gu],
  ['word:exchange', /\bexchange\b/gu],
  ['word:terminal', /\bterminal\b/gu],
  ['word:self-referential', /\bself-referential\b/giu],
]);

const TEXT_FILE_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.d.ts',
  '.js',
  '.json',
  '.jsx',
  '.mjs',
  '.md',
  '.mdx',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.proofs',
  '.next',
  '.pnpm-store',
  '.supabase',
  '.turbo',
  '.vercel',
  '.workbench',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);

const EXCLUDED_FILE_NAMES = new Set(['pnpm-lock.yaml']);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'source-snippets',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v43-route-vocabulary-migration-row:${digest(id)}`;
}

function fileRoot(relativePath, tokenCounts) {
  return `v43-route-vocabulary-file:${digest(JSON.stringify([relativePath, tokenCounts]))}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function lexicalCompare(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function countMatches(content, regex) {
  regex.lastIndex = 0;
  let count = 0;
  while (regex.exec(content) !== null) count += 1;
  return count;
}

function isTextFile(filePath) {
  if (EXCLUDED_FILE_NAMES.has(path.basename(filePath))) return false;
  return TEXT_FILE_EXTENSIONS.has(path.extname(filePath));
}

function isExcludedRelativePath(relativePath) {
  return relativePath.split('/').some((part) => EXCLUDED_DIRECTORIES.has(part));
}

function listGitTrackedTextFiles(repoRoot) {
  try {
    return execFileSync('git', ['-c', `safe.directory=${repoRoot}`, 'ls-files'], { cwd: repoRoot, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
      .filter((relativePath) => !isExcludedRelativePath(relativePath))
      .filter(isTextFile)
      .sort(lexicalCompare);
  } catch {
    return null;
  }
}

function listTextFiles(repoRoot, currentDirectory = repoRoot) {
  if (currentDirectory === repoRoot) {
    const gitTrackedFiles = listGitTrackedTextFiles(repoRoot);
    if (gitTrackedFiles) return gitTrackedFiles;
  }

  const entries = readdirSync(currentDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const absolutePath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRECTORIES.has(entry.name)) continue;
      files.push(...listTextFiles(repoRoot, absolutePath));
      continue;
    }

    if (!entry.isFile() || !isTextFile(absolutePath)) continue;
    files.push(path.relative(repoRoot, absolutePath).split(path.sep).join('/'));
  }

  return files.sort(lexicalCompare);
}

function categorizeFile(relativePath, content) {
  const categories = new Set();
  const extension = path.extname(relativePath);

  if (
    relativePath.startsWith('apps/uapi/app/') &&
    (relativePath.endsWith('/page.tsx') ||
      relativePath.endsWith('/layout.tsx') ||
      relativePath.endsWith('/route.ts') ||
      relativePath.endsWith('/route.tsx'))
  ) {
    categories.add('route');
  }
  if (relativePath.includes('/api/') || relativePath.endsWith('/route.ts')) categories.add('api');
  if (relativePath.endsWith('.tsx') || relativePath.includes('/components/')) categories.add('component');
  if (/(\btest\b|\.test\.|\.spec\.|__tests__)/u.test(relativePath)) categories.add('test');
  if (extension === '.md' || extension === '.mdx' || path.basename(relativePath).startsWith('README')) {
    categories.add('doc');
  }
  if (relativePath.startsWith('.github/workflows/')) categories.add('workflow');
  if (relativePath.startsWith('scripts/')) categories.add('script');
  if (relativePath.startsWith('packages/')) categories.add('package');
  if (relativePath.startsWith('.specifications/BITCODE_SPEC') || relativePath === '.specifications/SPECIFICATIONS_ROADMAP.md') {
    categories.add('spec');
  }
  if (/(telemetry|stream|execution|log)/iu.test(relativePath) || /(telemetry|stream|execution|log)/iu.test(content)) {
    categories.add('telemetry');
  }

  return [...categories].sort(lexicalCompare);
}

function scanRouteVocabulary(repoRoot) {
  const files = [];
  const tokenTotals = Object.fromEntries(V43_ROUTE_VOCABULARY_TOKEN_IDS.map((tokenId) => [tokenId, 0]));
  const categoryTotals = Object.fromEntries(V43_ROUTE_VOCABULARY_CATEGORY_IDS.map((categoryId) => [categoryId, 0]));

  for (const relativePath of listTextFiles(repoRoot)) {
    const content = readSource(repoRoot, relativePath);
    const tokenCounts = {};
    let totalMatches = 0;

    for (const [tokenId, regex] of TOKEN_SPECS) {
      const count = countMatches(content, regex);
      if (count > 0) {
        tokenCounts[tokenId] = count;
        tokenTotals[tokenId] += count;
        totalMatches += count;
      }
    }

    if (totalMatches === 0) continue;

    const categories = categorizeFile(relativePath, content);
    for (const category of categories) categoryTotals[category] += 1;

    files.push({
      path: relativePath,
      pathRoot: fileRoot(relativePath, tokenCounts),
      categories,
      tokenCounts,
      totalMatches,
      sourceSafeMetadataOnly: true,
      rawSourceTextSerialized: false,
      sourceSnippetSerialized: false,
    });
  }

  return {
    tokenTotals,
    categoryTotals,
    files,
    fileCount: files.length,
  };
}

function migrationRow(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_route_vocabulary_migration_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawSourceTextVisible: false,
    sourceSnippetVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    unpaidAssetPackSourceVisible: false,
    settlementPrivatePayloadVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V43_ROUTE_VOCABULARY_MIGRATION_ROWS = Object.freeze([
  migrationRow({
    rowId: 'packs-route-master-detail',
    fromVocabulary: ['/exchange', 'Exchange', 'exchange'],
    toVocabulary: ['/packs', 'Packs', 'PackActivity'],
    owningGate: 'V43 Gate 3 Packs Activity Master-Detail Data Model',
    compatibilityBoundary:
      'Existing exchange activity history is projected as source-safe PackActivity metadata; no unpaid AssetPack source becomes visible.',
    requiredMigrationWork: [
      'rename route path and app references to /packs',
      'rename component prefixes to Packs where the user-facing activity surface is meant',
      'preserve historical ledger and proof labels as metadata when old records already contain exchange wording',
      'add /exchange to /packs redirect until external links can be retired',
    ],
  }),
  migrationRow({
    rowId: 'read-route-five-step-reading',
    fromVocabulary: ['/packs', 'Reading'],
    toVocabulary: ['/read', 'ReadRouteSession', 'Reading'],
    owningGate: 'V43 Gate 4 Read Route Extraction And Five-Step UX',
    compatibilityBoundary:
      'Reading remains accepted-Need gated; retained cockpit code cannot bypass Need review, Finding Fits, settlement, rights transfer, or delivery reconciliation.',
    requiredMigrationWork: [
      'extract five-step Reading UX into /read',
      'hydrate historical readingStage and transaction query state into /read',
      'preserve rich execution log streaming and source-safe proof expansion',
      'keep unpaid AssetPack source hidden before settlement',
    ],
  }),
  migrationRow({
    rowId: 'deposit-route-agentic-options',
    fromVocabulary: ['/packs', 'Depositing'],
    toVocabulary: ['/deposit', 'DepositAssetPackOption', 'Depositing'],
    owningGate: 'V43 Gate 5 Deposit Route And Agentic AssetPack Option Synthesis',
    compatibilityBoundary:
      'Deposit options are unminted source-safe AssetPack proposals; approval admits supply to the Depository but does not mint BTD or expose source to readers.',
    requiredMigrationWork: [
      'extract source connection, depositor instructions, option synthesis, review, and admission into /deposit',
      'use Depository state and Reading demand as source-safe option-synthesis context',
      'show source criticality, likely demand, ROI posture, BTD potential, and compensation route',
      'synchronize admitted options into /packs activity',
    ],
  }),
  migrationRow({
    rowId: 'retained-debug-cockpit',
    fromVocabulary: ['/packs', 'product'],
    toVocabulary: ['internal cockpit', 'operator/debug surface'],
    owningGate: 'V43 Gate 8 UX/UI Product Excellence Pass',
    compatibilityBoundary:
      'If retained, cockpit surfaces are explicit internal/debug affordances and never the default product path for Depositing or Reading.',
    requiredMigrationWork: [
      'separate operator cockpit naming from product navigation',
      'remove default product links to /terminal',
      'verify retained cockpit cannot create second authority paths',
    ],
  }),
  migrationRow({
    rowId: 'redirect-compatibility',
    fromVocabulary: ['/exchange', '/packs'],
    toVocabulary: ['/packs', '/read', '/deposit'],
    owningGate: 'V43 Gate 9 Cross-Route Rehearsal, Telemetry, And Repair',
    compatibilityBoundary:
      'Redirects preserve transaction ids, reading stages, deposit anchors, and proof roots without changing protocol authority.',
    requiredMigrationWork: [
      'redirect /exchange to /packs',
      'route Reading terminal state to /read',
      'route Depositing terminal state to /deposit',
      'prove telemetry, database, ledger, and storage readback remain synchronized after redirects',
    ],
  }),
  migrationRow({
    rowId: 'self-referential-copy-removal',
    fromVocabulary: ['self-referential product explanation', 'instructional route copy'],
    toVocabulary: ['concise labels', 'progressive detail', 'source-safe proof expansion'],
    owningGate: 'V43 Gate 8 UX/UI Product Excellence Pass',
    compatibilityBoundary:
      'Public docs may explain the protocol; product UI should communicate through route structure, labels, state, and reusable components.',
    requiredMigrationWork: [
      'audit in-app self-referential copy outside public docs',
      'replace copy that describes the design with operational labels and state',
      'keep advanced detail available through expandable metadata and proof rows',
    ],
  }),
]);

function buildPredicateResults(repoRoot, scan) {
  const spec = readSource(repoRoot, '.specifications/BITCODE_SPEC_V43.md');
  const delta = readSource(repoRoot, '.specifications/BITCODE_SPEC_V43_DELTA.md');
  const notes = readSource(repoRoot, '.specifications/BITCODE_SPEC_V43_NOTES.md');
  const parity = readSource(repoRoot, '.specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md');
  const roadmap = readSource(repoRoot, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = readSource(repoRoot, 'README.md');
  const protocolReadme = readSource(repoRoot, 'scripts/specifying/README.md');
  const packageJson = readSource(repoRoot, 'package.json');
  const gateWorkflow = readSource(repoRoot, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = readSource(repoRoot, '.github/workflows/bitcode-canon-quality.yml');
  const index = readSource(repoRoot, 'scripts/specifying/src/index.js');
  const declarations = readSource(repoRoot, 'scripts/specifying/src/index.d.ts');
  const generator = readSource(repoRoot, 'scripts/generate-v43-route-vocabulary-inventory.mjs');
  const checker = readSource(repoRoot, 'scripts/check-v43-gate2-route-vocabulary-inventory.mjs');
  const test = readSource(repoRoot, 'scripts/specifying/test/v43-route-vocabulary-inventory.test.js');
  return [
    predicateResult(
      'active-canon-pointer-supports-v43-route-migration-posture',
      '.specifications/BITCODE_SPEC.txt',
      bitcodeVersionAtLeast(readSource(repoRoot, '.specifications/BITCODE_SPEC.txt'), 'V42'),
    ),
    predicateResult('spec-defines-gate2-inventory', '.specifications/BITCODE_SPEC_V43.md', spec.includes('V43 Gate 2') && spec.includes('route vocabulary inventory')),
    predicateResult('spec-defines-migration-matrix', '.specifications/BITCODE_SPEC_V43.md', spec.includes('migration matrix') && spec.includes('retained debug cockpit')),
    predicateResult('delta-records-gate2-artifact', '.specifications/BITCODE_SPEC_V43_DELTA.md', delta.includes('v43-route-vocabulary-inventory')),
    predicateResult('notes-record-gate2-artifact', '.specifications/BITCODE_SPEC_V43_NOTES.md', notes.includes('v43-route-vocabulary-inventory')),
    predicateResult('parity-records-gate2-artifact', '.specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md', parity.includes('v43-route-vocabulary-inventory')),
    predicateResult('roadmap-records-gate2-closure', '.specifications/SPECIFICATIONS_ROADMAP.md', roadmap.includes('V43 Gate 2 closure anchor')),
    predicateResult('readme-records-gate2', 'README.md', readme.includes('V43 Gate 2')),
    predicateResult('protocol-readme-records-gate2', 'scripts/specifying/README.md', protocolReadme.includes('V43 Gate 2')),
    predicateResult('package-exposes-gate2-scripts', 'package.json', packageJson.includes('"generate:v43-route-vocabulary-inventory"') && packageJson.includes('"check:v43-gate2"')),
    predicateResult('gate-workflow-runs-gate2', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('check-v43-gate2-route-vocabulary-inventory.mjs')),
    predicateResult('canon-workflow-runs-gate2', '.github/workflows/bitcode-canon-quality.yml', canonWorkflow.includes('check-v43-gate2-route-vocabulary-inventory.mjs')),
    predicateResult('protocol-index-exports-gate2', 'scripts/specifying/src/index.js', index.includes('buildV43RouteVocabularyInventory')),
    predicateResult('protocol-types-export-gate2', 'scripts/specifying/src/index.d.ts', declarations.includes('buildV43RouteVocabularyInventory')),
    predicateResult('generator-exists', 'scripts/generate-v43-route-vocabulary-inventory.mjs', generator.includes('buildV43RouteVocabularyInventory')),
    predicateResult('checker-exists', 'scripts/check-v43-gate2-route-vocabulary-inventory.mjs', checker.includes('V43 Gate 2 route vocabulary inventory check')),
    predicateResult('protocol-test-exists', 'scripts/specifying/test/v43-route-vocabulary-inventory.test.js', test.includes('buildV43RouteVocabularyInventory')),
    predicateResult('legacy-exchange-inventory-nonempty', 'source scan', scan.tokenTotals['route:/exchange'] > 0 || scan.tokenTotals['symbol:Exchange'] > 0 || scan.tokenTotals['word:exchange'] > 0),
    predicateResult('legacy-cockpit-inventory-nonempty', 'source scan', scan.tokenTotals['route:/terminal'] > 0 || scan.tokenTotals['symbol:product'] > 0 || scan.tokenTotals['word:terminal'] > 0),
    predicateResult('target-route-vocabulary-present', 'source scan', scan.tokenTotals['route:/packs'] > 0 && scan.tokenTotals['route:/read'] > 0 && scan.tokenTotals['route:/deposit'] > 0),
    predicateResult('pack-activity-vocabulary-present', 'source scan', scan.tokenTotals['symbol:PackActivity'] > 0),
    predicateResult('deposit-option-vocabulary-present', 'source scan', scan.tokenTotals['symbol:DepositAssetPackOption'] > 0),
    predicateResult('migration-rows-complete', 'scripts/specifying/src/canonical/v43-route-vocabulary-inventory.js', V43_ROUTE_VOCABULARY_MIGRATION_ROWS.length === V43_ROUTE_VOCABULARY_MIGRATION_ROW_IDS.length),
    predicateResult('required-categories-covered', 'source scan', V43_ROUTE_VOCABULARY_CATEGORY_IDS.every((categoryId) => scan.categoryTotals[categoryId] > 0)),
  ];
}

export function buildV43RouteVocabularyInventory(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const scan = scanRouteVocabulary(repoRoot);
  const predicateResults = buildPredicateResults(repoRoot, scan);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const artifactRoot = `v43-route-vocabulary-inventory:${digest(JSON.stringify({
    tokenTotals: scan.tokenTotals,
    categoryTotals: scan.categoryTotals,
    files: scan.files.map((file) => [file.path, file.pathRoot, file.totalMatches]),
    migrationRows: V43_ROUTE_VOCABULARY_MIGRATION_ROWS.map((row) => row.rowRoot),
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-route-vocabulary-inventory',
    schemaId: V43_ROUTE_VOCABULARY_INVENTORY_SCHEMA_ID,
    version: V43_ROUTE_VOCABULARY_INVENTORY_VERSION,
    currentTarget: V43_ROUTE_VOCABULARY_INVENTORY_CURRENT_TARGET,
    sourceSafetyVerdict: V43_ROUTE_VOCABULARY_INVENTORY_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    tokenIds: [...V43_ROUTE_VOCABULARY_TOKEN_IDS],
    categoryIds: [...V43_ROUTE_VOCABULARY_CATEGORY_IDS],
    migrationRowIds: [...V43_ROUTE_VOCABULARY_MIGRATION_ROW_IDS],
    migrationRows: V43_ROUTE_VOCABULARY_MIGRATION_ROWS,
    predicateResults,
    sourceFiles: scan.files,
    coverage: {
      sourceFileCount: scan.fileCount,
      tokenTotals: scan.tokenTotals,
      categoryTotals: scan.categoryTotals,
      routeVocabularyInventoryComplete: true,
      migrationMatrixComplete: true,
      packsMigrationPlanned: true,
      readMigrationPlanned: true,
      depositMigrationPlanned: true,
      retainedDebugCockpitBoundaryPlanned: true,
      redirectCompatibilityPlanned: true,
      selfReferentialCopyRemovalPlanned: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      sourceSnippetVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      unpaidAssetPackSourceVisible: false,
      settlementPrivatePayloadVisible: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}
