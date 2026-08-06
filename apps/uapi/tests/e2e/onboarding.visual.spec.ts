import { test, expect } from '@playwright/test';

test.describe('@profile UI Visual - Auth and Onboarding Flows', () => {
  test('Connect modal snapshot', async ({ page }) => {
    // Open the login modal via the public-shell launcher.
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Wait for email input to appear
    await page.waitForSelector('[data-testid="login-email-input"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('login-page.png');
  });

  test('Onboarding - Profile step snapshot', async ({ page }) => {
    // Navigate to app and open onboarding modal
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Profile step contains email input
    await page.waitForSelector('[data-testid="profile-step-badge"]');
    await page.waitForSelector('[data-testid="profile-email-input"]');
    // Stabilize animation
    await page.waitForTimeout(500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-profile-step.png');
  });

  test('Onboarding - Externals step snapshot', async ({ page }) => {
    // Navigate to the app and open onboarding.
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Navigate to the canonical externals step.
    await page.click('[data-auxillaries-testid="auxillaries-label-externals"]');
    // Wait for the externals-step elements.
    await page.waitForSelector('[data-testid="externals-step-badge"]');
    await page.waitForSelector('[data-testid="externals-github-button"]');
    await page.waitForTimeout(500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-externals-step.png');
  });

  test('Onboarding - Interfaces step snapshot', async ({ page }) => {
    // Navigate to the app and open onboarding.
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Navigate through the canonical steps to WalletInterfaces.
    await page.click('[data-auxillaries-testid="auxillaries-label-externals"]');
    await page.click('[data-auxillaries-testid="auxillaries-label-interfaces"]');
    // Wait for the interfaces-step elements.
    await page.waitForSelector('[data-testid="interfaces-step-badge"]');
    await page.waitForSelector('[data-testid="models-prompt-input"]');
    await page.waitForTimeout(500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-interfaces-step.png');
  });

  test('Onboarding - $BTD step snapshot', async ({ page }) => {
    // Navigate to the app and open onboarding.
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Navigate through the canonical steps to Wallet$BTD.
    await page.click('[data-auxillaries-testid="auxillaries-label-externals"]');
    await page.click('[data-auxillaries-testid="auxillaries-label-interfaces"]');
    await page.click('[data-auxillaries-testid="auxillaries-label-wallet"]');
    // Wait for the Wallet-step elements.
    await page.waitForSelector('[data-testid="wallet-step-badge"]');
    await page.waitForSelector('[data-testid="wallet-pane-container"]');
    await page.waitForTimeout(500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-wallet-step.png');
  });
});
