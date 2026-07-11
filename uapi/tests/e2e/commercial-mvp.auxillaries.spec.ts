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
    path: '/auxillaries/wallet',
    heading: /Wallet in one contained auxillary read/i,
    container: 'wallet-pane-container',
  },
  {
    step: 'externals',
    path: '/auxillaries/externals',
    heading: /Externals in one contained auxillary read/i,
    container: 'externals-pane-container',
  },
  {
    step: 'profile',
    path: '/auxillaries/profile',
    heading: /Profile in one contained auxillary read/i,
    container: 'profile-step-container',
  },
  {
    step: 'interfaces',
    path: '/auxillaries/interfaces',
    heading: /Interfaces in one contained auxillary read/i,
    container: 'interfaces-pane-container',
  },
] as const;

test.describe('commercial MVP Auxillaries experience', () => {
  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  for (const auxillary of AUXILLARY_ROUTES) {
    test(`${auxillary.step} route renders a contained tabs-left auxillary pane`, async ({
      page,
    }, testInfo) => {
      const trap = installCommercialBrowserErrorTrap(page, testInfo);

      await openCommercialRoute(page, auxillary.path, auxillary.heading);

      await expect(page.getByTestId(auxillary.container)).toBeVisible();
      await expect(page.getByText('Open Packs')).toBeVisible();
      await expect(page.getByText('Current route')).toBeVisible();
      await expect(page.locator('text=/lane(active|ready|locked)/i')).toHaveCount(0);
      await expect(page.locator('.orbital-ring')).toHaveCount(0);
      await expect(page.locator('.login-background-glow')).toHaveCount(0);

      await trap.assertClean();
    });
  }

  test('route cards and pane tabs preserve route-local Auxillaries navigation', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/auxillaries/profile', /Profile in one contained auxillary read/i);

    await page.locator('a[href="/auxillaries/externals"]').first().click();
    await expect(page).toHaveURL(/\/auxillaries\/externals$/);
    await expectCommercialRouteReady(page, /Externals in one contained auxillary read/i);

    await page.getByRole('button', { name: /^Interfaces auxillary$/ }).click();
    await expect(page.getByTestId('interfaces-pane-container')).toBeVisible();
    await expect(
      page
        .getByTestId('interfaces-pane-container')
        .getByRole('heading', { name: /^Interfaces Auxillary$/ }),
    ).toBeVisible();

    await page.getByRole('button', { name: /^Wallet auxillary$/ }).click();
    await expect(page.getByTestId('wallet-pane-container')).toBeVisible();
    await expect(
      page
        .getByTestId('wallet-pane-container')
        .getByRole('heading', { name: /^Wallet Auxillary$/ }),
    ).toBeVisible();

    await trap.assertClean();
  });

  test('Profile auxillary keeps optional identity editable without owning wallet or GitHub controls', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/auxillaries/profile', /Profile in one contained auxillary read/i);

    await expect(page.getByLabel('Display Name')).toHaveValue('Avery Mercer');
    await expect(page.getByLabel('Professional Bio')).toHaveValue(
      'Reviewing the Bitcode commercial surface in deterministic mock mode.',
    );
    await expect(page.getByLabel('Company')).toHaveValue('Bitcode Review Lab');
    await expect(page.getByText(/Email does not authenticate Bitcode/i)).toBeVisible();
    await expect(page.getByText(/Wallets live in Wallet; GitHub and other providers live in Externals/i)).toBeVisible();
    await expect(page.getByTestId('profile-wallet-address-input')).toHaveCount(0);
    await expect(page.getByTestId('profile-connect-leather')).toHaveCount(0);
    await expect(page.getByText(/Connect GitHub for source-bearing input/i)).toHaveCount(0);

    await trap.assertClean();
  });

  test('Wallet connection stays on Wallet and does not run onboarding completion in contained Auxillaries', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);
    let onboardingRequests = 0;

    await page.addInitScript(() => {
      (window as any).LeatherProvider = {
        request: async (method: string, params?: Record<string, unknown>) => {
          (window as any).__bitcodeWalletCalls = [
            ...((window as any).__bitcodeWalletCalls ?? []),
            { method, params },
          ];

          if (method === 'getAddresses') {
            return {
              result: {
                addresses: [
                  {
                    symbol: 'BTC',
                    type: 'p2wpkh',
                    address: 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq',
                    publicKey: 'payment-public-key',
                    derivationPath: "m/84'/1'/1'/0/0",
                  },
                  {
                    symbol: 'BTC',
                    type: 'p2tr',
                    address: 'tb1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
                    publicKey: 'auth-public-key',
                    tweakedPublicKey: 'auth-tweaked-public-key',
                    derivationPath: "m/86'/1'/1'/0/0",
                  },
                ],
              },
            };
          }

          if (method === 'signMessage') {
            return { result: { signature: 'leather-contained-profile-signature' } };
          }

          return { result: null };
        },
      };
    });
    await page.route('**/api/auxillaries/onboarding', async (route) => {
      onboardingRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ completedPanes: ['wallet'], isOnboardingComplete: false }),
      });
    });

    await openCommercialRoute(page, '/auxillaries/wallet', /Wallet in one contained auxillary read/i);
    await expect(page.getByTestId('wallet-pane-container')).toBeVisible();
    await expect(page.getByTestId('wallet-connect-leather')).toBeVisible();

    await page.getByTestId('wallet-connect-leather').click();
    await expect(page.getByTestId('wallet-pane-container')).toBeVisible();
    await expect(page.getByText(/Bitcoin provider connected/i)).toBeVisible();
    await expect(page.getByText(/Leather/i)).toBeVisible();
    await expect(page.getByText(/tb1pqqqqqq/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auxillaries\/wallet$/);
    await expect.poll(() => Promise.resolve(onboardingRequests)).toBe(0);

    const calls = await page.evaluate(() => (window as any).__bitcodeWalletCalls ?? []);
    expect(calls.map((call: { method: string }) => call.method)).toEqual(['getAddresses', 'signMessage']);

    await trap.assertClean();
  });

  test('Auxillaries portal entry opens the contained access surface without the old onboarding shell', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/packs', /Bitcode Terminal/i);

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('open-auxillaries', {
          detail: { window: 'SignUpWindow' },
        }),
      );
    });

    const portal = page.locator('.auxillaries-portal');
    await expect(portal.locator('.auxillaries-bitcode-surface.orbital-system-application')).toBeVisible();
    await expect(portal.locator('.login-background-glow')).toHaveCount(0);
    await expect(portal.locator('.account-background-highlight')).toHaveCount(0);
    await expect(portal.locator('.orbital-ring')).toHaveCount(0);

    await trap.assertClean();
  });

  test('Terminal fullscreen Auxillaries fills the viewport and keeps Profile scrolling inside the pane', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/packs', /Bitcode Terminal/i);

    await page.getByRole('button', { name: /Open Auxillaries fullscreen/i }).click();
    const shell = page.locator('.auxillaries-bitcode-shell');
    await expect(shell).toBeVisible();

    await page.getByRole('button', { name: /^Profile auxillary$/ }).click();
    await expect(page.getByTestId('profile-step-container')).toBeVisible();

    const shellBottomGap = await shell.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return Math.round(window.innerHeight - rect.bottom);
    });
    expect(shellBottomGap).toBeLessThanOrEqual(2);

    const pane = page.locator('.auxillaries-bitcode-pane > .orbital-content-container').first();
    const paneScrollMetrics = await pane.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      const style = window.getComputedStyle(element);
      return {
        scrollTop: Math.round(element.scrollTop),
        clientHeight: Math.round(element.clientHeight),
        scrollHeight: Math.round(element.scrollHeight),
        overflowY: style.overflowY,
      };
    });
    expect(paneScrollMetrics.overflowY).toBe('auto');
    expect(paneScrollMetrics.scrollHeight).toBeGreaterThan(paneScrollMetrics.clientHeight);
    expect(paneScrollMetrics.scrollTop).toBeGreaterThan(0);
    await expect(page.getByText(/Profile edits save automatically/i)).toBeVisible();

    await trap.assertClean();
  });

  test('Externals, Interfaces, and Wallet panes expose MVP configuration consequences', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/auxillaries/externals', /Externals in one contained auxillary read/i);
    await expect(page.getByText(/GitHub and verified wallet are ready/i)).toBeVisible();
    await expect(page.getByText(/GitHub plus wallet posture are the minimum live prerequisites/i)).toBeVisible();

    await page.goto('/auxillaries/interfaces');
    await expectCommercialRouteReady(page, /Interfaces in one contained auxillary read/i);
    await expect(page.getByText(/Terminal detail and interface defaults/i)).toBeVisible();
    await expect(page.getByText('Pipeline models', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Registry fixed', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Apply to All/i })).toHaveCount(0);
    const modelPreferenceSave = page.waitForResponse((response) => {
      return (
        response.url().includes('/api/auxillaries/model-preferences') &&
        response.request().method() === 'POST'
      );
    });
    await page.getByRole('button', { name: /raw/i }).first().click();
    await modelPreferenceSave;

    await page.goto('/auxillaries/wallet');
    await expectCommercialRouteReady(page, /Wallet in one contained auxillary read/i);
    const walletPane = page.getByTestId('wallet-pane-container');
    await expect(walletPane.getByText('1,200 BTD')).toBeVisible();
    await expect(walletPane.getByText(/0\.042 BTC/i)).toBeVisible();
    await expect(page.getByText(/BTC is the fee-liquidity posture/i)).toBeVisible();
    await expect(page.getByText(/Read your BTD-relevant activity from the shared activity table/i)).toBeVisible();
    await expect(page.getByText(/Searchable activity table/i)).toBeVisible();
    await expect(page.getByText(/Changes save automatically so the BTD posture/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Wallet auxillary/i })).toHaveCount(0);

    await trap.assertClean();
  });

  test('Externals data-share consent toggles persist through the contained pane API', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    await openCommercialRoute(page, '/auxillaries/externals', /Externals in one contained auxillary read/i);

    const externalsPane = page.getByTestId('externals-pane-container');
    await expect(externalsPane.getByText('Read-space knowledge sharing')).toBeVisible();
    await expect(externalsPane.getByText(/All current and future Externals-approved repositories/i)).toBeVisible();

    const setAndForgetToggle = externalsPane.getByText('Set it and forget it', { exact: true }).locator('..').locator('label');
    const disableAllRequest = page.waitForResponse((response) => (
      response.url().includes('/api/auxillaries/user/data-share') &&
      response.request().method() === 'POST'
    ));
    await setAndForgetToggle.click();
    const disableAllResponse = await disableAllRequest;
    const disableAllPayload = disableAllResponse.request().postDataJSON() as Record<string, unknown>;
    expect(disableAllPayload).toMatchObject({
      action: 'toggle',
      repoFullName: 'bitcode/bitcode',
      enabled: false,
    });

    const repoRow = externalsPane
      .getByTestId('externals-data-share-repositories')
      .getByTestId('externals-data-share-repo-row')
      .filter({ hasText: 'bitcode/bitcode' });
    await expect(repoRow).toBeVisible();
    await expect(repoRow.getByText('main')).toBeVisible();
    await expect(repoRow.locator('input[type="checkbox"]')).not.toBeChecked();

    const enableRepoRequest = page.waitForResponse((response) => (
      response.url().includes('/api/auxillaries/user/data-share') &&
      response.request().method() === 'POST'
    ));
    await repoRow.locator('label').click();
    const enableRepoResponse = await enableRepoRequest;
    const enableRepoPayload = enableRepoResponse.request().postDataJSON() as Record<string, unknown>;
    expect(enableRepoPayload).toMatchObject({
      action: 'toggle',
      repoFullName: 'bitcode/bitcode',
      branch: 'main',
      commit: '8d4d0a7',
      enabled: true,
    });
    await expect(externalsPane.getByText(/All current and future Externals-approved repositories/i)).toBeVisible();

    await trap.assertClean();
  });
});
