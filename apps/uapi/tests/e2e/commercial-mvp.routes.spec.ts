import { expect, test } from '@playwright/test';

import {
  expectCommercialRouteReady,
  installCommercialMvpApiMocks,
  installCommercialBrowserErrorTrap,
  openCommercialRoute,
} from './commercial-mvp.helpers';

// Product routes are /reads, /exchange, /deposits. Auxillaries open as the
// Exchange support plane via query or /auxillaries/* overlays.
const ROUTE_SMOKE_MATRIX = [
  {
    path: '/',
    expected: /Trade technical data on the Bitcode exchange/i,
    name: 'public home',
  },
  {
    path: '/exchange',
    expected: /Packs Market|Exchange/i,
    name: 'Exchange',
  },
  {
    path: '/exchange?auxillary-open-to=wallet',
    expected: /Wallet Auxillary/i,
    name: 'Wallet auxillary',
  },
  {
    path: '/exchange?auxillary-open-to=profile',
    expected: /Profile Auxillary/i,
    name: 'Profile auxillary',
  },
  {
    path: '/exchange?auxillary-open-to=externals',
    expected: /Externals Auxillary/i,
    name: 'Externals auxillary',
  },
  {
    path: '/exchange?auxillary-open-to=interfaces',
    expected: /Interfaces Auxillary/i,
    name: 'Interfaces auxillary',
  },
  {
    path: '/docs',
    expected: /Learn Bitcode from AssetPacks to proof/i,
    name: 'docs home',
  },
  {
    path: '/docs/source-shares',
    expected: /AssetPacks, BTD, and the Bitcode activity ledger/i,
    name: 'source-shares docs',
  },
  {
    path: '/docs/product-workspace',
    expected: /Orient inside the Bitcode/i,
    name: 'product map docs',
  },
  {
    path: '/docs/product-actions',
    expected: /Actions: what writes and what should read back/i,
    name: 'action manual docs',
  },
  {
    path: '/docs/read-results',
    expected: /Reads, proofs, readiness, and expected results/i,
    name: 'read-results docs',
  },
  {
    path: '/docs/auxillaries',
    expected: /Configure Auxillaries for wallet, externals, profile, and interfaces/i,
    name: 'Auxillaries docs',
  },
  {
    path: '/docs/configuration',
    expected: /Read launch-mode, environment, and feature configuration clearly/i,
    name: 'configuration docs',
  },
  {
    path: '/docs/protocol',
    expected: /Map the active Protocol canon/i,
    name: 'protocol canon docs',
  },
  {
    path: '/docs/proofs',
    expected: /Understand Bitcode proofs, witnesses, and replay/i,
    name: 'proof docs',
  },
  {
    path: '/docs/settlement-btd',
    expected: /Read settlement, \$BTD, and exact accounting/i,
    name: 'settlement BTD docs',
  },
  {
    path: '/docs/commercial-interfaces',
    expected: /Understand commercial Bitcode interfaces/i,
    name: 'commercial interfaces docs',
  },
  {
    path: '/docs/mcp-api',
    expected: /Operate Bitcode through MCP and API surfaces/i,
    name: 'MCP API docs',
  },
  {
    path: '/docs/chatgpt-app',
    expected: /Use the ChatGPT App as a connected Bitcode interface/i,
    name: 'ChatGPT App docs',
  },
] as const;

test.describe('commercial MVP route surfaces', () => {
  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  for (const route of ROUTE_SMOKE_MATRIX) {
    test(`${route.name} route is readable and free of browser errors`, async ({ page }, testInfo) => {
      const trap = installCommercialBrowserErrorTrap(page, testInfo);

      await openCommercialRoute(page, route.path, route.expected);

      await trap.assertClean();
    });
  }

  test('public navigation keeps Read, Exchange, Deposit, and logo-area docs as commercial routes', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await page.goto('/');
    await expectCommercialRouteReady(
      page,
      /Trade technical data on the Bitcode exchange/i,
    );

    // Product order: Read | Exchange | Deposit; docs lives under the logo-area.
    await page.getByRole('link', { name: 'Read' }).first().click();
    await expect(page).toHaveURL(/\/reads/);

    await page.getByRole('link', { name: 'Exchange' }).first().click();
    await expect(page).toHaveURL(/\/exchange/);

    await page.getByRole('link', { name: 'Deposit' }).first().click();
    await expect(page).toHaveURL(/\/deposits/);

    await page.getByRole('link', { name: 'Docs' }).first().click();
    await expect(page).toHaveURL(/\/docs$/);
    await expectCommercialRouteReady(page, /Learn Bitcode from AssetPacks to proof/i);

    await trap.assertClean();
  });
});
