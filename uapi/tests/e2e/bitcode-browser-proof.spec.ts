import { expect, test, type Page } from '@playwright/test';

import {
  expectNoFrameworkOverlay,
  expectReadableViewport,
  installCommercialBrowserErrorTrap,
  installCommercialMvpApiMocks,
  openCommercialRoute,
} from './commercial-mvp.helpers';

const PROOF_VIEWPORTS = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'desktop', width: 1440, height: 900 },
] as const;

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(metrics.viewportWidth, `${label} viewport width`).toBeGreaterThan(0);
  expect(metrics.overflow, `${label} horizontal overflow`).toBeLessThanOrEqual(48);
}

test.describe('Bitcode browser proof across product surfaces', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('Deposits and Reads product surfaces and selected telemetry remain semantic', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    for (const viewport of PROOF_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await openCommercialRoute(page, '/deposits', /Depositing/i);
      await expect(page.getByTestId('route-shell-deposit')).toBeVisible();
      await expect(page.getByTestId('deposits-pipelines-table')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expectNoHorizontalOverflow(page, `deposits-pipelines-${viewport.id}`);

      await openCommercialRoute(
        page,
        '/deposits?transactionId=mock-run-branch-remediation',
        /Depositing/i,
      );
      await expect(page.getByTestId('route-shell-deposit')).toBeVisible();
      await expectNoHorizontalOverflow(page, `deposits-selected-telemetry-${viewport.id}`);

      await openCommercialRoute(page, '/reads', /Reading/i);
      await expect(page.getByTestId('route-shell-read')).toBeVisible();
      await expect(page.getByTestId('reads-pipelines-table')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expectNoHorizontalOverflow(page, `reads-pipelines-${viewport.id}`);

      await openCommercialRoute(
        page,
        '/reads?transactionId=mock-run-branch-remediation',
        /Reading/i,
      );
      await expect(page.getByTestId('route-shell-read')).toBeVisible();
      await expectNoHorizontalOverflow(page, `reads-selected-telemetry-${viewport.id}`);
    }

    await trap.assertClean();
  });

  test('Conversation source-safe handoff, Exchange rights review, and public docs are readable', async ({
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
    await expect(page.locator('textarea.rich-text-input').first()).toBeVisible();
    await expectReadableViewport(page);

    await openCommercialRoute(
      page,
      '/exchange?assetPack=asset-pack-run-branch-remediation&intent=buy-existing-btd',
      /Read market activity, select an order, and inspect Exchange state/i,
    );
    await expect(page.getByText(/source-safe preview/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /mock-run-branch-remediation/i })).toBeVisible();
    await expectNoHorizontalOverflow(page, 'Exchange rights review');

    await openCommercialRoute(page, '/docs', /Learn Bitcode from AssetPacks to proof/i);
    await expect(page.getByText(/Action manual/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Action manual/i })).toBeVisible();
    await expectNoHorizontalOverflow(page, 'source-safe public docs');

    await trap.assertClean();
  });

  test('Auxillaries and visual proof stay no-screenshot-only-approval through responsive semantics', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    for (const viewport of PROOF_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openCommercialRoute(page, '/packs?auxillary-open-to=wallet', /Wallet Auxillary/i);

      await expect(page.getByRole('main', { name: 'Bitcode Auxillaries support plane' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Skip to active support pane' })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Auxillaries pane navigation' })).toBeVisible();
      await expect(page.getByRole('region', { name: /Wallet active support pane/i })).toHaveAttribute(
        'aria-live',
        'polite',
      );
      await expect(page.getByTestId('auxillaries-audit-detail')).toContainText('source-safe summary only');
      await expectNoHorizontalOverflow(page, `auxillaries-${viewport.id}`);
    }

    await expectNoFrameworkOverlay(page);
    await trap.assertClean();
  });
});
