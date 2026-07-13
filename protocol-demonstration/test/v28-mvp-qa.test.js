import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/**
 * V28 commercial-MVP static product-surface witnesses.
 * Paths track the current Bitcode layout (no dual `components/base/*` homes).
 */

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
const v28SpecSource = readFileSync(new URL('../../BITCODE_SPEC_V28.md', import.meta.url), 'utf8');
const v28NotesSource = readFileSync(new URL('../../BITCODE_SPEC_V28_NOTES.md', import.meta.url), 'utf8');

const productMvpE2eFiles = [
  '../../uapi/tests/e2e/commercial-mvp.helpers.ts',
  '../../uapi/tests/e2e/commercial-mvp.routes.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.btd-exchange.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.conversations-docs.spec.ts',
  '../../uapi/tests/e2e/commercial-mvp.responsive.spec.ts',
];

test('V28 BTD tracker renders BTC and BTD as peer wallet balances', () => {
  assert.match(btdTrackerSource, /formatBtcFeeBalance\(displayedBtcFeeBalance\)/u);
  assert.match(btdTrackerSource, /displayedBtdBalance\.toLocaleString\(\)\} BTD/u);
  assert.match(btdTrackerSource, /inline-block h-4 w-\[2px\].*rounded-full.*bg-emerald-100\/75/u);
  assert.match(btdTrackerSource, /gapPx = 14/u);
  assert.match(btdTrackerSource, /grid items-center gap-x-3\.5/u);
  assert.equal(btdTrackerSource.includes('| ${displayedBtdBalance'), false);
  assert.doesNotMatch(btdTrackerSource, /\$BTD/u);
});

test('V28 BTD tracker opens wallet-owned BTD auxillary posture', () => {
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

test('V28 generic Exchange intent entry does not auto-focus the first activity route', () => {
  assert.doesNotMatch(
    packsPageClientSource,
    /replaceExchangeSearchParams\(writeTerminalTransactionId\(routeSearchParams, runs\[0\]\.id\)\)/u,
  );
  assert.match(shippablesCardsPanelSource, /autoScrollOnAnimation = true/u);
  // Terminal surface retired; executions host uses default autoScroll (true).
  assert.match(executionsPageClientSource, /<ShippablesCardsPanel/u);
  assert.doesNotMatch(executionsPageClientSource, /autoScrollOnAnimation=\{false\}/u);
});

test('V28 BTD tracker hover context lists recent BTD AssetPacks', () => {
  assert.match(btdTrackerSource, /Recent BTD AssetPacks:/u);
  assert.match(btdTrackerSource, /title=\{recentAssetPackTitle\}/u);
  assert.doesNotMatch(btdTrackerSource, /BTC pays fees; BTD is a non-fungible AssetPack share\/read-right/u);
  assert.match(navSource, /recentBtdAssetPacks=\{recentBtdAssetPacks\}/u);
  assert.match(userDataHookSource, /recentBtdAssetPacks/u);
  assert.match(auxillariesContractSource, /recentBtdAssetPacks: AuxillaryBtdAssetPackSummary\[\]/u);
  assert.match(mockReviewModeSource, /recentBtdAssetPacks: \[/u);
});

test('V28 MVP Playwright suite covers product-experiential route and interaction proof', () => {
  for (const file of productMvpE2eFiles) {
    assert.equal(existsSync(new URL(file, import.meta.url)), true, `${file} must exist`);
  }

  assert.match(uapiPackageSource, /test:e2e:commercial-mvp/u);
  assert.match(uapiPackageSource, /--workers=1/u);
  assert.match(v28SpecSource, /commercial-MVP Playwright E2E tests/u);
  assert.match(v28NotesSource, /product-experiential, not generic smoke testing/u);

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

  assert.match(suiteSource, /\/terminal/u);
  assert.match(suiteSource, /\/exchange/u);
  assert.match(suiteSource, /\/auxillaries\/profile/u);
  assert.match(suiteSource, /\/auxillaries\/externals/u);
  assert.match(suiteSource, /\/auxillaries\/interfaces/u);
  assert.match(suiteSource, /\/auxillaries\/wallet/u);
  assert.match(suiteSource, /\/btd\/asset-pack-run-branch-remediation/u);
  assert.match(suiteSource, /\/conversations/u);
  assert.match(suiteSource, /\/docs/u);
  assert.match(suiteSource, /Open BTD wallet auxillary|bitcode:btd-wallet-intent/u);
  assert.match(suiteSource, /Search transactions/u);
  assert.match(suiteSource, /transactionSearch/u);
  assert.match(suiteSource, /transactionOwnership/u);
  assert.match(suiteSource, /Clear all filters/u);
  assert.match(suiteSource, /Read-space knowledge sharing/u);
  assert.match(suiteSource, /data-share/u);
  assert.match(suiteSource, /Add split pane/u);
  assert.match(suiteSource, /\/docs\/mcp-api/u);
  assert.match(suiteSource, /\/docs\/chatgpt-app/u);
  assert.match(suiteSource, /setViewportSize/u);
});

test('V28 provider dependencies are owned at the provider package boundary', () => {
  assert.match(genericLlmsRegistryPackageSource, /"@bitcode\/generic-llms-openai": "workspace:\*"/u);
  assert.match(genericLlmsRegistryPackageSource, /"@bitcode\/generic-llms-anthropic": "workspace:\*"/u);
  assert.match(genericLlmsRegistryPackageSource, /"@bitcode\/generic-llms-google": "workspace:\*"/u);
  assert.match(genericLlmsOpenAiPackageSource, /"openai": "4\.97\.0"/u);
  assert.match(genericLlmsAnthropicPackageSource, /"@anthropic-ai\/sdk": "0\.15\.0"/u);
  assert.match(genericLlmsGooglePackageSource, /"@ai-sdk\/google": "1\.0\.4"/u);
});
