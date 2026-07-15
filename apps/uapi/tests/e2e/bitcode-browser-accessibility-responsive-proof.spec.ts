import { expect, test, type Page } from '@playwright/test';

import {
  expectNoFrameworkOverlay,
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

test.describe('Bitcode browser accessibility responsive proof', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('Deposits and Reads default and selected states stay semantic and responsive', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    for (const viewport of PROOF_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await openCommercialRoute(page, '/deposits', /Depositing/i);
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByTestId('route-shell-deposit')).toBeVisible();
      await expect(page.getByTestId('deposits-pipelines-table')).toBeVisible();
      await expectNoHorizontalOverflow(page, `deposits-${viewport.id}-default`);

      await openCommercialRoute(
        page,
        '/deposits?transactionId=mock-run-branch-remediation',
        /Depositing/i,
      );
      await expect(page.getByTestId('route-shell-deposit')).toBeVisible();
      await expectNoHorizontalOverflow(page, `deposits-${viewport.id}-detail`);

      await openCommercialRoute(page, '/reads', /Reading/i);
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByTestId('route-shell-read')).toBeVisible();
      await expect(page.getByTestId('reads-pipelines-table')).toBeVisible();
      await expectNoHorizontalOverflow(page, `reads-${viewport.id}-default`);

      await openCommercialRoute(
        page,
        '/reads?transactionId=mock-run-branch-remediation',
        /Reading/i,
      );
      await expect(page.getByTestId('route-shell-read')).toBeVisible();
      await expectNoHorizontalOverflow(page, `reads-${viewport.id}-detail`);
    }

    await expectNoFrameworkOverlay(page);
    await trap.assertClean();
  });

  test('Auxillaries default, guided, and detail states stay semantic and responsive', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    for (const viewport of PROOF_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openCommercialRoute(page, '/packs?auxillary-open-to=wallet', /Wallet Auxillary/i);

      await expect(page.getByRole('main', { name: 'Bitcode Auxillaries support plane' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Skip to active support pane' })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Auxillaries pane navigation' })).toBeVisible();
      await expect(page.getByRole('region', { name: /Wallet active support pane/i })).toBeVisible();
      await expectNoHorizontalOverflow(page, `auxillaries-${viewport.id}-default`);

      await openCommercialRoute(page, '/packs?auxillary-open-to=profile', /Profile Auxillary/i);
      const activePane = page.getByRole('region', { name: /Profile active support pane/i });
      await expect(activePane).toHaveAttribute('aria-live', 'polite');
      await expect(activePane).toHaveAttribute('aria-busy', 'false');
      await expect(page.getByText('Audit detail')).toBeVisible();
      await expectNoHorizontalOverflow(page, `auxillaries-${viewport.id}-guided`);

      await openCommercialRoute(page, '/packs?auxillary-open-to=interfaces', /Interfaces Auxillary/i);
      await expect(page.getByTestId('interfaces-pane-container')).toBeVisible();
      await expect(page.getByTestId('auxillaries-interface-admission-catalog')).toBeVisible();
      await expect(page.getByTestId('auxillaries-audit-detail')).toContainText('source-safe summary only');
      await expectNoHorizontalOverflow(page, `auxillaries-${viewport.id}-detail`);
    }

    await expectNoFrameworkOverlay(page);
    await trap.assertClean();
  });
});
