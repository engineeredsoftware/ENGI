/**
 * Commercial MVP Auxillaries experience — V48.
 *
 * Auxillaries open as the Packs support plane via `?auxillary-open-to=`.
 * Assertions match the green gate browser-proof / a11y proof surface contracts.
 */
import { expect, test } from '@playwright/test';

import {
  expectCommercialRouteReady,
  installCommercialMvpApiMocks,
  installCommercialBrowserErrorTrap,
  openCommercialRoute,
} from './commercial-mvp.helpers';

const AUXILLARY_ROUTES = [
  {
    step: 'wallet',
    path: '/packs?auxillary-open-to=wallet',
    heading: /Wallet Auxillary/i,
    region: /Wallet active support pane/i,
  },
  {
    step: 'externals',
    path: '/packs?auxillary-open-to=externals',
    heading: /Externals Auxillary/i,
    region: /Externals active support pane/i,
  },
  {
    step: 'profile',
    path: '/packs?auxillary-open-to=profile',
    heading: /Profile Auxillary/i,
    region: /Profile active support pane/i,
  },
  {
    step: 'interfaces',
    path: '/packs?auxillary-open-to=interfaces',
    heading: /Interfaces Auxillary/i,
    region: /Interfaces active support pane/i,
  },
] as const;

test.describe('commercial MVP Auxillaries experience', () => {
  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  for (const auxillary of AUXILLARY_ROUTES) {
    test(`${auxillary.step} auxillary opens as the Packs support plane`, async ({
      page,
    }, testInfo) => {
      const trap = installCommercialBrowserErrorTrap(page, testInfo);

      await openCommercialRoute(page, auxillary.path, auxillary.heading);

      await expect(page.getByRole('main', { name: 'Bitcode Auxillaries support plane' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Skip to active support pane' })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Auxillaries pane navigation' })).toBeVisible();
      await expect(page.getByRole('region', { name: auxillary.region })).toBeVisible();
      await expect(page.locator('.orbital-ring')).toHaveCount(0);

      await trap.assertClean();
    });
  }

  test('pane navigation keeps Auxillaries on Packs with support-plane semantics', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/packs?auxillary-open-to=profile', /Profile Auxillary/i);
    await expect(page.getByRole('region', { name: /Profile active support pane/i })).toBeVisible();

    await openCommercialRoute(page, '/packs?auxillary-open-to=interfaces', /Interfaces Auxillary/i);
    await expect(page.getByTestId('interfaces-pane-container')).toBeVisible();
    await expect(page.getByTestId('auxillaries-interface-admission-catalog')).toBeVisible();

    await openCommercialRoute(page, '/packs?auxillary-open-to=wallet', /Wallet Auxillary/i);
    await expect(page.getByRole('region', { name: /Wallet active support pane/i })).toBeVisible();

    await trap.assertClean();
  });

  test('Profile auxillary exposes audit detail on the Packs support plane', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/packs?auxillary-open-to=profile', /Profile Auxillary/i);
    await expect(page.getByRole('region', { name: /Profile active support pane/i })).toBeVisible();
    await expect(page.getByText('Audit detail')).toBeVisible();

    await trap.assertClean();
  });
});
