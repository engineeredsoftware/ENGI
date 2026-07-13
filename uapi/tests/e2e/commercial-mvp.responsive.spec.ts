import { expect, test } from '@playwright/test';

import {
  expectCommercialRouteReady,
  installCommercialMvpApiMocks,
  installCommercialBrowserErrorTrap,
  openCommercialRoute,
} from './commercial-mvp.helpers';

const RESPONSIVE_ROUTES = [
  {
    path: '/terminal',
    expected: /The Bitcode Terminal is where operators prepare Deposit and Read work/i,
  },
  {
    path: '/auxillaries/wallet',
    expected: /Wallet in one contained auxillary read/i,
  },
  {
    path: '/auxillaries/externals',
    expected: /Externals in one contained auxillary read/i,
  },
] as const;

test.describe('commercial MVP responsive route health', () => {
  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  for (const route of RESPONSIVE_ROUTES) {
    test(`${route.path} remains readable on phone and widescreen`, async ({ page }, testInfo) => {
      const trap = installCommercialBrowserErrorTrap(page, testInfo);

      await page.setViewportSize({ width: 390, height: 844 });
      const firstDataShareResponse = route.path === '/auxillaries/externals'
        ? page.waitForResponse((response) =>
          response.url().includes('/api/auxillaries/user/data-share'),
        )
        : Promise.resolve(null);
      await openCommercialRoute(page, route.path, route.expected);
      await firstDataShareResponse;
      await expect(page.locator('body')).toBeVisible();

      await page.setViewportSize({ width: 1440, height: 900 });
      const reloadDataShareResponse = route.path === '/auxillaries/externals'
        ? page.waitForResponse((response) =>
          response.url().includes('/api/auxillaries/user/data-share'),
        )
        : Promise.resolve(null);
      await page.reload();
      await reloadDataShareResponse;
      await expectCommercialRouteReady(page, route.expected);

      await trap.assertClean();
    });
  }

  test('commercial nav keeps top-right wallet state usable on narrow desktop', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await page.setViewportSize({ width: 1024, height: 768 });
    await openCommercialRoute(page, '/terminal', /The Bitcode Terminal is where operators prepare Deposit and Read work/i);

    await expect(page.getByRole('link', { name: /^Read$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Packs$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Deposit$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Docs$/ })).toBeVisible();
    await expect(page.getByLabel(/Open BTD wallet auxillary/i)).toBeVisible();

    await trap.assertClean();
  });
});
