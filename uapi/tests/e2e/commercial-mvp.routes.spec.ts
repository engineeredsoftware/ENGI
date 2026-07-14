import { expect, test } from '@playwright/test';

import {
  expectCommercialRouteReady,
  installCommercialMvpApiMocks,
  installCommercialBrowserErrorTrap,
  openCommercialRoute,
} from './commercial-mvp.helpers';

// V48: product routes are /reads, /packs, /deposits (no /terminal). Auxillaries
// open as the packs support plane via query or /auxillaries/* overlays.
const ROUTE_SMOKE_MATRIX = [
  {
    path: '/',
    expected: /Bitcode is auditable market infrastructure for technical knowledge/i,
    name: 'public home',
  },
  {
    path: '/packs',
    expected: /Pack activity/i,
    name: 'Packs',
  },
  {
    path: '/packs?auxillary-open-to=wallet',
    expected: /Wallet Auxillary/i,
    name: 'Wallet auxillary',
  },
  {
    path: '/packs?auxillary-open-to=profile',
    expected: /Profile Auxillary/i,
    name: 'Profile auxillary',
  },
  {
    path: '/packs?auxillary-open-to=externals',
    expected: /Externals Auxillary/i,
    name: 'Externals auxillary',
  },
  {
    path: '/packs?auxillary-open-to=interfaces',
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
    path: '/docs/terminal',
    expected: /Orient inside the Bitcode Terminal/i,
    name: 'Terminal map docs',
  },
  {
    path: '/docs/terminal-actions',
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

  test('public navigation keeps Read, Packs, Deposit, and logo-area docs as commercial routes', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await page.goto('/');
    await expectCommercialRouteReady(
      page,
      /Bitcode is auditable market infrastructure for technical knowledge/i,
    );

    // Product order: Read | Packs | Deposit; docs lives under the logo-area.
    await page.getByRole('link', { name: 'Read' }).first().click();
    await expect(page).toHaveURL(/\/reads/);

    await page.getByRole('link', { name: 'Packs' }).first().click();
    await expect(page).toHaveURL(/\/packs/);

    await page.getByRole('link', { name: 'Deposit' }).first().click();
    await expect(page).toHaveURL(/\/deposits/);

    await page.getByRole('link', { name: 'Docs' }).first().click();
    await expect(page).toHaveURL(/\/docs$/);
    await expectCommercialRouteReady(page, /Learn Bitcode from AssetPacks to proof/i);

    await trap.assertClean();
  });
});
