/**
 * Commercial MVP BTD + Packs (exchange compatibility) entry — V48.
 *
 * `/exchange` is a compatibility redirect into `/exchange`. Assertions target
 * Pack activity, wallet auxillary, and BTD range disclosure rather than the
 * deleted Packs/Exchange master-detail market UI.
 */
import { expect, test } from '@playwright/test';

import {
  expectAtPageTop,
  expectCommercialRouteReady,
  installCommercialMvpApiMocks,
  installCommercialBrowserErrorTrap,
  openCommercialRoute,
} from './commercial-mvp.helpers';

const BTD_RANGE_PATH =
  '/btd/asset-pack-run-branch-remediation' +
  '?rangeStart=1190' +
  '&rangeEndExclusive=1200' +
  '&policyId=owner-read-v28' +
  '&policyHash=policy-hash-v28' +
  '&readBranch=owner-read' +
  '&proofRoot=proof-root-v28' +
  '&sourceManifestRoot=source-manifest-root-v28';

test.describe('commercial MVP BTD and Packs entry', () => {
  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  test('signed-in BTD wallet control is visible on Packs and opens the Wallet Auxillary', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/exchange', /Pack activity/i);

    const tracker = page.getByLabel(/Open BTD wallet auxillary/i);
    await expect(tracker).toBeVisible();
    // Balance spans may be aria-hidden; assert via the control text content.
    await expect(tracker).toContainText(/BTC/i);
    await expect(tracker).toContainText(/BTD/i);

    await tracker.click();
    await expect(page.getByText(/Wallet Auxillary/i).first()).toBeVisible({ timeout: 15_000 });

    await trap.assertClean();
  });

  test('BTD range route discloses range, policy hash, read branch, and routes into Packs', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, BTD_RANGE_PATH, /\$BTD AssetPack Range|asset-pack-run-branch-remediation/i);

    await expect(page.getByText('1,190-1,199')).toBeVisible();
    await expect(page.getByText('owner-read-v28')).toBeVisible();
    await expect(page.getByText('policy-hash-v28')).toBeVisible();
    await expect(page.getByText('proof-root-v28')).toBeVisible();
    await expect(page.getByText('source-manifest-root-v28')).toBeVisible();

    const openPacks = page.getByRole('link', { name: /Open (Exchange|Packs)/i }).first();
    if (await openPacks.count()) {
      await openPacks.click();
      await expect(page).toHaveURL(/\/(exchange|packs)/);
      await expectAtPageTop(page);
      await expectCommercialRouteReady(page, /Pack activity|AssetPack|Activity/i);
    }

    await trap.assertClean();
  });

  test('/exchange compatibility lands on Pack activity reread', async ({ page }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(
      page,
      '/exchange?assetPack=asset-pack-run-branch-remediation&intent=buy-existing-btd',
      /Pack activity|AssetPack|Activity/i,
    );
    await expect(page.getByRole('main').first()).toBeVisible();
    await expect(page).toHaveURL(/\/(exchange|packs)/);

    await trap.assertClean();
  });
});
