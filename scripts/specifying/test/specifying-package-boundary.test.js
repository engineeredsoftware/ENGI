import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '..', '..');
const importBoundaryPattern = /(?:import\s+(?:[^'"]+\s+from\s+)?|import\s*\(|require\s*\()\s*['"][^'"]*(?:@bitcode\/protocol-demonstration|protocol-demonstration\/)/;
const demonstrationSourceImportPattern = /(?:import\s+(?:[^'"]+\s+from\s+)?|import\s*\(|require\s*\()\s*['"][^'"]*(?:@bitcode\/protocol-demonstration|protocol-demonstration\/src)/;

function collectRuntimeFiles(root) {
  const files = [];

  for (const entry of readdirSync(root)) {
    const absolutePath = path.join(root, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'coverage' || entry === 'dist') continue;
      files.push(...collectRuntimeFiles(absolutePath));
      continue;
    }

    if (entry.endsWith('.js') || entry.endsWith('.mjs') || entry.endsWith('.cjs')) {
      files.push(absolutePath);
    }
  }

  return files;
}

test('@bitcode/specifying does not import removed standalone witness packages', async () => {
  const runtimeFiles = [path.join(packageRoot, 'server.js'), ...collectRuntimeFiles(path.join(packageRoot, 'src'))];
  const violations = runtimeFiles
    .filter((filePath) => importBoundaryPattern.test(readFileSync(filePath, 'utf8')))
    .map((filePath) => path.relative(packageRoot, filePath));

  assert.deepEqual(violations, []);
  const protocol = await import('../src/index.js');
  assert.equal(typeof protocol.createAppContext, 'function');
});

test('@bitcode/specifying commercial formalization exports package-native canon helpers', async () => {
  const protocol = await import('../src/index.js');
  const pointer = readFileSync(path.join(repoRoot, '.specifications/BITCODE_SPEC.txt'), 'utf8').trim();
  const expectedPostureByPointer = {
    V28: { activeCanon: 'V28', draftTarget: 'V29' },
    V29: { activeCanon: 'V29', draftTarget: 'V30' },
    V30: { activeCanon: 'V30', draftTarget: 'V31' },
    V31: { activeCanon: 'V31', draftTarget: 'V32' },
    V32: { activeCanon: 'V32', draftTarget: 'V33' },
    V33: { activeCanon: 'V33', draftTarget: 'V34' },
    V34: { activeCanon: 'V34', draftTarget: 'V35' },
    V35: { activeCanon: 'V35', draftTarget: 'V36' },
    V36: { activeCanon: 'V36', draftTarget: 'V37' },
    V37: { activeCanon: 'V37', draftTarget: 'V38' },
    V38: { activeCanon: 'V38', draftTarget: 'V39' },
    V39: { activeCanon: 'V39', draftTarget: 'V40' },
    V40: { activeCanon: 'V40', draftTarget: 'V41' },
    V41: { activeCanon: 'V41', draftTarget: 'V42' },
    V42: { activeCanon: 'V42', draftTarget: 'V43' },
    V43: { activeCanon: 'V43', draftTarget: 'V44' },
    V44: { activeCanon: 'V44', draftTarget: 'V45' },
    V45: { activeCanon: 'V45', draftTarget: 'V46' },
    V46: { activeCanon: 'V46', draftTarget: 'V47' },
    V47: { activeCanon: 'V47', draftTarget: 'V48' },
  };
  const expectedPosture = expectedPostureByPointer[pointer];

  assert.ok(expectedPosture, `Unsupported canonical pointer in protocol package boundary test: ${pointer}`);

  assert.equal(protocol.ACTIVE_CANON_VERSION, expectedPosture.activeCanon);
  assert.equal(protocol.DRAFT_TARGET_VERSION, expectedPosture.draftTarget);
  assert.equal(typeof protocol.buildV21SpecFamilyReport, 'function');
  assert.equal(typeof protocol.buildV21CanonicalInputReport, 'function');
  assert.equal(typeof protocol.buildV21GeneratedArtifactContents, 'function');
  assert.equal(typeof protocol.buildCanonPostureDriftReport, 'function');
  assert.equal(typeof protocol.PROVEN_GENERATOR_ID, 'string');
  assert.equal(typeof protocol.defaultProvenOutputPath, 'function');
  assert.equal(typeof protocol.generateCanonicalProvenMarkdown, 'function');
  assert.equal(typeof protocol.buildV40PromotionReadinessReport, 'function');
  assert.equal(typeof protocol.V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH, 'string');
  assert.equal(
    protocol.defaultProvenOutputPath(expectedPosture.activeCanon),
    `.specifications/BITCODE_SPEC_${expectedPosture.activeCanon}_PROVEN.md`,
  );
  const specFamilyReport = protocol.buildV21SpecFamilyReport({
    version: expectedPosture.activeCanon,
    mode: 'promoted',
    currentTarget: expectedPosture.activeCanon,
  });
  const canonicalInputReport = protocol.buildV21CanonicalInputReport({ currentTarget: expectedPosture.activeCanon });
  assert.equal(specFamilyReport.passed, true);
  assert.equal(canonicalInputReport.passed, true);
});

test('commercial scripts do not import removed standalone witness source', () => {
  const runtimeFiles = collectRuntimeFiles(path.join(repoRoot, 'scripts'));
  const violations = runtimeFiles
    .filter((filePath) => demonstrationSourceImportPattern.test(readFileSync(filePath, 'utf8')))
    .map((filePath) => path.relative(repoRoot, filePath));

  assert.deepEqual(violations, []);
});

test('@bitcode/specifying does not ship a demonstration shell public bundle', () => {
  // Product core systems live in packages/*; scripts/specifying is tooling only.
  // The former public demonstration shell must stay deleted.
  assert.equal(
    statSync(path.join(packageRoot, 'public', 'app.js'), { throwIfNoEntry: false })?.isFile() ?? false,
    false,
  );
  assert.equal(
    statSync(path.join(packageRoot, 'public', 'index.html'), { throwIfNoEntry: false })?.isFile() ?? false,
    false,
  );
});

test('@bitcode/specifying accepts live repository revision deposits without legacy inventory ids', async () => {
  const protocol = await import('../src/index.js');
  const tempDir = mkdtempSync(path.join(tmpdir(), 'bitcode-protocol-repo-deposit-'));
  try {
    const app = protocol.createAppContext({
      dataPath: path.join(tempDir, 'state.json'),
      publicDir: path.join(packageRoot, 'public'),
    });

    const result = app.createDeposit({
      title: 'ENGI repository revision',
      sourceProvider: 'github',
      sourceRepo: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: 'abc123456789',
      signerAddress: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
      signingAlgorithm: 'bitcoin_message_signature',
      keySource: 'leather-browser-wallet',
      walletAuthorizationProof: {
        message: 'Bitcode deposit authorization',
        signature: 'signed-by-wallet',
        provider: 'leather',
      },
    });

    assert.equal(result.ok, true);
    assert.equal(result.asset.metadata.author, 'engineeredsoftware');
    assert.equal(result.asset.artifactKind, 'repository-revision');
    assert.equal(result.asset.artifactType, 'vcs-source-anchor');
    assert.equal(result.asset.addressingSurface.repo, 'engineeredsoftware/ENGI');
    assert.equal(result.asset.addressingSurface.ref, 'main');
    assert.equal(result.asset.addressingSurface.commit, 'abc123456789');
    assert.equal(result.asset.addressingSurface.addressingScope, 'repo-commit');
    assert.equal(result.asset.repositoryFullName, 'engineeredsoftware/ENGI');
    assert.equal(result.asset.sourceBranch, 'main');
    assert.equal(result.asset.sourceCommit, 'abc123456789');
    assert.equal(result.asset.hasWalletOrAttestationProof, true);
    assert.equal(result.asset.hasAssetMeasurementEvidence, true);
    assert.match(result.asset.proofRoot, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.asset.measurementRoot, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.asset.reconciliationReadbackRoot, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.depositoryEvidence.depositorySearchDocumentRoot, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.depositoryEvidence.lexicalDocumentRoot, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.depositoryEvidence.vectorDocumentRoot, /^sha256:[a-f0-9]{64}$/);
    assert.equal(result.depositoryEvidence.depositorBoundary.walletId, `wallet:${result.asset.signingSurface.signerAddress}`);
    assert.equal(result.depositoryEvidence.indexState.vector, 'ready_for_embedding_generation');
    assert.equal(result.depositoryEvidence.searchDocuments.vector.embeddingPolicy.model, 'text-embedding-3-small');
    assert.equal(result.depositoryEvidence.searchDocuments.vector.embeddingPolicy.dimensions, 1536);
    assert.equal(result.depositoryEvidence.searchDocuments.vector.embeddingPolicy.vectorStore.rpc, 'match_deliverable_vectors');
    assert.equal(result.depositoryEvidence.compensationPreview.state, 'eligible-if-selected-for-assetpack');
    assert.equal(result.depositoryEvidence.compensationPreview.compensationRoute.priceAsset, 'BTC');
    assert.equal(
      result.depositoryEvidence.compensationPreview.compensationRoute.allocationMethod,
      'source-to-shares-largest-remainder',
    );
    assert.equal(
      result.depositoryEvidence.compensationPreview.compensationRoute.btdMintBoundary,
      'not-minted-by-deposit-admission',
    );
    assert.equal(result.depositoryEvidence.compensationPreview.visibility.protectedSourceVisible, false);
    assert.equal(result.depositoryEvidence.compensationPreview.visibility.unpaidAssetPackSourceVisible, false);
    assert.equal(result.depositoryEvidence.compensationPreview.readiness.eligibleForFindingFits, true);
    assert.equal(result.depositoryEvidence.compensationPreview.readiness.eligibleForCompensationIfSelected, true);
    assert.match(result.depositoryEvidence.compensationPreviewRoot, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.depositoryEvidence.sourceToSharesPreviewRoot, /^sha256:[a-f0-9]{64}$/);
    assert.equal(
      result.asset.compensationPreview.roots.compensationPreviewRoot,
      result.depositoryEvidence.compensationPreviewRoot,
    );
    const state = app.getState('internal');
    assert.equal(
      state.ledger.accounts[`depositor:${result.depositoryEvidence.depositorBoundary.walletId}:eligible_compensation_routes`],
      '1',
    );
    const depositedText = result.asset.contentUnits?.[0]?.text;
    assert.match(depositedText, /Bitcode repository revision deposit/);
    assert.match(depositedText, /Repository: engineeredsoftware\/ENGI/);
    assert.match(depositedText, /Commit: abc123456789/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
