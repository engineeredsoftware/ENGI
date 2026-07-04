import { expect, test } from '@playwright/test';

import {
  expectCommercialRouteReady,
  installCommercialMvpApiMocks,
  installCommercialBrowserErrorTrap,
  openCommercialRoute,
} from './commercial-mvp.helpers';

test.describe('commercial MVP conversations and docs experiences', () => {
  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  test('Conversations route opens fullscreen writing mode and submits a Terminal-bound message', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(
      page,
      '/conversations',
      /Keep the Bitcode Terminal write path as a first-class Terminal interface mode/i,
    );

    await expect(page.getByRole('button', { name: /Add split pane/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Toggle pipeline log location/i })).toBeVisible();
    const exitFullscreen = page.locator('button[aria-label="Exit fullscreen"]');
    await expect(exitFullscreen).toBeVisible();

    await page.getByRole('button', { name: /Add split pane/i }).click();
    await expect(page.locator('textarea.rich-text-input')).toHaveCount(2);

    const input = page.locator('textarea.rich-text-input').last();
    await expect(input).toBeVisible();
    await input.fill('Summarize the selected Read and keep the result Packs-readable.');
    await input.press('Enter');

    await expect(page.getByText(/Summarize the selected Read/i).first()).toBeVisible();
    await expect(page.getByText(/Bitcode mock mode received/i).first()).toBeVisible();
    await expect(page.getByText('2 messages').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close split' })).toHaveCount(2);

    await exitFullscreen.click();
    await expect(page).toHaveURL(/\/terminal$/);

    await trap.assertClean();
  });

  test('Docs home teaches user order and routes into the Terminal action manual', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/docs', /Learn Bitcode from AssetPacks to proof/i);

    await expect(page.getByText(/Start with AssetPacks/i)).toBeVisible();
    await expect(
      page.getByText(
        'Then learn /deposits, /reads, and /packs before opening value-bearing controls.',
      ),
    ).toBeVisible();
    await expect(page.getByText(/Action manual/i)).toBeVisible();

    await page.getByRole('link', { name: /Action manual/i }).click();
    await expect(page).toHaveURL(/\/docs\/terminal-actions$/);
    await expectCommercialRouteReady(page, /Terminal actions: what writes and what should read back/i);
    await expect(page.getByText(/Every Terminal write should have an expected read result/i)).toBeVisible();

    await trap.assertClean();
  });

  test('Docs article links keep public learning tied to commercial surfaces', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/docs/exchange', /Understand \/exchange compatibility and \/packs/i);

    await expect(page.getByText(/\/exchange redirects to \/packs/i)).toBeVisible();
    await page.getByRole('link', { name: /Open Terminal map/i }).click();
    await expect(page).toHaveURL(/\/docs\/terminal$/);
    await expectCommercialRouteReady(page, /Orient inside the Bitcode Terminal/i);

    await page.getByRole('link', { name: /Read action guide/i }).click();
    await expect(page).toHaveURL(/\/docs\/terminal-actions$/);
    await expectCommercialRouteReady(page, /Terminal actions: what writes and what should read back/i);

    await page.getByRole('link', { name: /^Use Terminal$/ }).click();
    await expect(page).toHaveURL(/\/terminal$/);
    await expectCommercialRouteReady(page, /The Bitcode Terminal is where operators prepare Deposit and Read work/i);

    await trap.assertClean();
  });
});
