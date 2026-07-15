/**
 * V48 living product-layout MVP witnesses (current sole-canon realization).
 *
 * Complements era-pinned `v28-mvp-qa.test.js` (frozen historical paths).
 * When the layout moves again, add V{N} living checks and era-pin this file —
 * do not rewrite V28.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const btdTrackerSource = readFileSync(
  new URL('../../uapi/components/bitcode/btd/BtdTracker/BtdTracker.tsx', import.meta.url),
  'utf8',
);
const navSource = readFileSync(
  new URL('../../uapi/components/bitcode/layout/Nav/Nav.tsx', import.meta.url),
  'utf8',
);
const userDataHookSource = readFileSync(
  new URL('../../uapi/hooks/useUserData.ts', import.meta.url),
  'utf8',
);
const auxillariesContractSource = readFileSync(
  new URL('../../packages/api/src/routes/auxillaries-contract.ts', import.meta.url),
  'utf8',
);
const mockReviewModeSource = readFileSync(
  new URL('../../uapi/lib/mock-review-mode.ts', import.meta.url),
  'utf8',
);
const packsPageClientSource = readFileSync(
  new URL('../../uapi/components/packs/PacksPageClient/PacksPageClient.tsx', import.meta.url),
  'utf8',
);
const shippablesCardsPanelSource = readFileSync(
  new URL('../../uapi/components/bitcode/pipeline/ShippablesCardsPanel/ShippablesCardsPanel.tsx', import.meta.url),
  'utf8',
);
const executionsPageClientSource = readFileSync(
  new URL('../../uapi/components/bitcode/pipeline/ExecutionsPageClient/ExecutionsPageClient.tsx', import.meta.url),
  'utf8',
);
const uapiPackageSource = readFileSync(
  new URL('../../uapi/package.json', import.meta.url),
  'utf8',
);
const genericLlmsRegistryPackageSource = readFileSync(
  new URL('../../packages/generic-llms/registry/package.json', import.meta.url),
  'utf8',
);
const genericLlmsOpenAiPackageSource = readFileSync(
  new URL('../../packages/generic-llms/OpenAI/package.json', import.meta.url),
  'utf8',
);
const genericLlmsAnthropicPackageSource = readFileSync(
  new URL('../../packages/generic-llms/Anthropic/package.json', import.meta.url),
  'utf8',
);
const genericLlmsGooglePackageSource = readFileSync(
  new URL('../../packages/generic-llms/Google/package.json', import.meta.url),
  'utf8',
);

const productMvpE2eFiles = [
  '../../uapi/tests/e2e/commercial-mvp.helpers.ts',
  '../../uapi/tests/e2e/commercial-mvp.routes.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.btd-exchange.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.conversations-docs.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.responsive.spec.ts',
];

test('V48 BTD tracker renders BTC and BTD as peer wallet balances', () => {
  assert.match(btdTrackerSource, /formatBtcFeeBalance\(displayedBtcFeeBalance\)/u);
  assert.match(btdTrackerSource, /displayedBtdBalance\.toLocaleString\(\)\} BTD/u);
  assert.match(btdTrackerSource, /inline-block h-4 w-\[2px\].*rounded-full.*bg-emerald-100\/75/u);
  assert.match(btdTrackerSource, /gapPx = 14/u);
  assert.match(btdTrackerSource, /grid items-center gap-x-3\.5/u);
  assert.equal(btdTrackerSource.includes('| ${displayedBtdBalance'), false);
  assert.doesNotMatch(btdTrackerSource, /\$BTD/u);
});

test('V48 BTD tracker opens wallet-owned BTD auxillary posture', () => {
  assert.match(btdTrackerSource, /Open BTD wallet auxillary/u);
  assert.match(btdTrackerSource, /walletActionLabel/u);
  assert.match(btdTrackerSource, /bitcode:btd-wallet-intent/u);
  assert.match(btdTrackerSource, /buildAuxillariesRoutePath\('wallet'\)/u);
  assert.match(btdTrackerSource, /wallet-auxillary/u);
  assert.doesNotMatch(btdTrackerSource, /Acquire BTD/u);
  assert.doesNotMatch(btdTrackerSource, /Acquire \$BTD/u);
  assert.doesNotMatch(btdTrackerSource, /acquire-btd/u);
  assert.doesNotMatch(btdTrackerSource, /Exchange BTD/u);
});

test('V48 packs entry does not auto-focus the first activity route', () => {
  assert.doesNotMatch(
    packsPageClientSource,
    /replaceExchangeSearchParams\(writeTerminalTransactionId\(routeSearchParams, runs\[0\]\.id\)\)/u,
  );
  assert.match(shippablesCardsPanelSource, /autoScrollOnAnimation = true/u);
  assert.match(executionsPageClientSource, /<ShippablesCardsPanel/u);
  assert.doesNotMatch(executionsPageClientSource, /autoScrollOnAnimation=\{false\}/u);
});

test('V48 BTD tracker hover context lists recent BTD AssetPacks', () => {
  assert.match(btdTrackerSource, /Recent BTD AssetPacks:/u);
  assert.match(btdTrackerSource, /title=\{recentAssetPackTitle\}/u);
  assert.doesNotMatch(btdTrackerSource, /BTC pays fees; BTD is a non-fungible AssetPack share\/read-right/u);
  assert.match(navSource, /recentBtdAssetPacks=\{recentBtdAssetPacks\}/u);
  assert.match(userDataHookSource, /recentBtdAssetPacks/u);
  assert.match(auxillariesContractSource, /recentBtdAssetPacks: AuxillaryBtdAssetPackSummary\[\]/u);
  assert.match(mockReviewModeSource, /recentBtdAssetPacks: \[/u);
});

test('V48 commercial MVP Playwright suite files remain present', () => {
  for (const file of productMvpE2eFiles) {
    assert.equal(existsSync(new URL(file, import.meta.url)), true, `${file} must exist`);
  }

  assert.match(uapiPackageSource, /test:e2e:commercial-mvp/u);
  assert.match(uapiPackageSource, /--workers=1/u);

  const helperSource = readFileSync(
    new URL('../../uapi/tests/e2e/commercial-mvp.helpers.ts', import.meta.url),
    'utf8',
  );
  assert.match(helperSource, /api\/auxillaries\/model-preferences/u);
  assert.match(helperSource, /api\/auxillaries\/user\/data-share/u);

  const suiteSource = productMvpE2eFiles
    .filter((file) => !file.endsWith('helpers.ts'))
    .map((file) => readFileSync(new URL(file, import.meta.url), 'utf8'))
    .join('\n');

  assert.match(suiteSource, /\/packs/u);
  assert.match(suiteSource, /\/exchange/u);
  // V48: Auxillaries open as the Packs support plane (query), not legacy
  // /auxillaries/{pane} product routes.
  assert.match(suiteSource, /auxillary-open-to=profile/u);
  assert.match(suiteSource, /auxillary-open-to=externals/u);
  assert.match(suiteSource, /auxillary-open-to=interfaces/u);
  assert.match(suiteSource, /auxillary-open-to=wallet/u);
  assert.match(suiteSource, /\/btd\/asset-pack-run-branch-remediation/u);
  assert.match(suiteSource, /\/conversations/u);
  assert.match(suiteSource, /\/docs/u);
  assert.match(suiteSource, /Open BTD wallet auxillary|bitcode:btd-wallet-intent/u);
  // Packs master filters (Terminal transaction filters retired from product MVP).
  assert.match(suiteSource, /Pack activity/u);
  assert.match(suiteSource, /my-assetpacks|settled-assetpack|depository-assetpack/u);
  assert.match(suiteSource, /data-share/u);
  assert.match(suiteSource, /\/docs\/mcp-api/u);
  assert.match(suiteSource, /\/docs\/chatgpt-app/u);
  assert.match(suiteSource, /setViewportSize/u);
});

test('V48 provider dependencies are owned at nested generic-llms package boundaries', () => {
  assert.match(genericLlmsRegistryPackageSource, /"@bitcode\/generic-llms-openai": "workspace:\*"/u);
  assert.match(genericLlmsRegistryPackageSource, /"@bitcode\/generic-llms-anthropic": "workspace:\*"/u);
  assert.match(genericLlmsRegistryPackageSource, /"@bitcode\/generic-llms-google": "workspace:\*"/u);
  assert.match(genericLlmsOpenAiPackageSource, /"openai": "4\.97\.0"/u);
  assert.match(genericLlmsAnthropicPackageSource, /"@anthropic-ai\/sdk": "0\.15\.0"/u);
  assert.match(genericLlmsGooglePackageSource, /"@ai-sdk\/google": "1\.0\.4"/u);
});
