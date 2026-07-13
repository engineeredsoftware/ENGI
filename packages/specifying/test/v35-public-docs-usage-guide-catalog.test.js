import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  PUBLIC_DOCS_USAGE_GUIDE_CATALOG_ARTIFACT_PATH,
  PUBLIC_DOCS_USAGE_GUIDE_IDS,
  buildPublicDocsUsageGuideCatalog,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 PublicDocsUsageGuideCatalog rows', () => {
  const catalog = buildPublicDocsUsageGuideCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(catalog.artifactId, 'v35-public-docs-usage-guides');
  assert.equal(catalog.schemaId, 'bitcode.v35.publicDocsUsageGuideCatalog.v1');
  assert.equal(catalog.version, 'V35');
  assert.equal(catalog.currentTarget, 'V34');
  assert.equal(catalog.passed, true);
  assert.equal(catalog.sourceSafetyVerdict, 'source-safe-public-docs-metadata');
  assert.equal(catalog.coverage.guideCount, PUBLIC_DOCS_USAGE_GUIDE_IDS.length);
  assert.deepEqual(catalog.coverage.missingRequiredGuideIds, []);
  assert.deepEqual(catalog.coverage.missingSourceRoots, []);
  assert.deepEqual(catalog.coverage.missingPublicRoutes, []);
  assert.equal(catalog.coverage.terminalRepresented, true);
  assert.equal(catalog.coverage.protocolRepresented, true);
  assert.equal(catalog.coverage.auxillariesRepresented, true);
  assert.equal(catalog.coverage.mcpApiRepresented, true);
  assert.equal(catalog.coverage.chatgptAppRepresented, true);
  assert.equal(catalog.coverage.btdRepresented, true);
  assert.equal(catalog.coverage.assetPackRangesRepresented, true);
  assert.equal(catalog.coverage.readsRepresented, true);
  assert.equal(catalog.coverage.feesRepresented, true);
  assert.equal(catalog.coverage.proofPostureRepresented, true);
  assert.equal(catalog.coverage.exchangeDeferredBoundaryRepresented, true);
  assert.equal(catalog.coverage.conversationsDeferredBoundaryRepresented, true);
  assert.equal(catalog.coverage.credentialsSerialized, false);
  assert.equal(catalog.coverage.protectedSourceVisible, false);
  assert.equal(catalog.coverage.rawProtectedPromptVisible, false);
  assert.equal(catalog.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(catalog.coverage.walletPrivateMaterialVisible, false);
  assert.match(catalog.artifactRoot, /^public-docs-usage-guides:[a-f0-9]{24}$/u);

  for (const guideId of PUBLIC_DOCS_USAGE_GUIDE_IDS) {
    assert.equal(catalog.rows.some((row) => row.guideId === guideId), true, `missing ${guideId}`);
  }

  for (const row of catalog.rows) {
    assert.match(row.guideRoot, /^public-docs-guide-row:[a-f0-9]{24}$/u);
    assert.equal(row.routePresent, true);
    assert.equal(row.forbiddenPublicContent.includes('secret_values'), true);
    assert.equal(row.forbiddenPublicContent.includes('raw_protected_prompts'), true);
    assert.equal(row.forbiddenPublicContent.includes('wallet_private_material'), true);
    assert.equal(row.forbiddenPublicContent.includes('unpaid_assetpack_source'), true);
    assert.equal(row.allowedPublicContent.includes('proof_roots'), true);
    assert.equal(row.freshnessChecks[0].command, 'pnpm run check:v35-public-docs-usage-guides');
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.publicRoute.startsWith('/docs/'));
    assert.ok(row.canonicalTruth.length > 0);
    assert.ok(row.disclosureNotes.length > 0);
  }
});

test('binds public docs to Bitcode usage domains and deferred boundaries', () => {
  const catalog = buildPublicDocsUsageGuideCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byGuideId = new Map(catalog.rows.map((row) => [row.guideId, row]));

  assert.equal(byGuideId.get('terminal_usage')?.publicRoute, '/docs/terminal');
  assert.equal(byGuideId.get('mcp_api_usage')?.publicRoute, '/docs/mcp-api');
  assert.equal(byGuideId.get('chatgpt_app_usage')?.publicRoute, '/docs/chatgpt-app');
  assert.equal(byGuideId.get('btd_usage')?.publicRoute, '/docs/settlement-btd');
  assert.equal(byGuideId.get('assetpack_ranges_usage')?.publicRoute, '/docs/read-results');
  assert.equal(byGuideId.get('reads_usage')?.proofSignals.includes('fit search admission'), true);
  assert.equal(byGuideId.get('fees_usage')?.proofSignals.includes('btc fee finality state'), true);
  assert.equal(byGuideId.get('proof_posture_usage')?.proofSignals.includes('redaction state'), true);
  assert.equal(byGuideId.get('exchange_deferred_boundary')?.publicRoute, '/docs/exchange');
  assert.equal(byGuideId.get('conversations_deferred_boundary')?.publicRoute, '/docs/conversations');
  assert.equal(
    catalog.disclosureBoundary.settlementBoundary.includes('source-bearing AssetPack contents cross to the reader only after settlement'),
    true,
  );
  assert.equal(PUBLIC_DOCS_USAGE_GUIDE_CATALOG_ARTIFACT_PATH, '.bitcode/v35-public-docs-usage-guides.json');
});
