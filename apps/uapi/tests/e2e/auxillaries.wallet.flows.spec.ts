import { test, expect } from '@playwright/test';
import { setOnboardingState } from './auxillaries.helpers';

test.describe('Auxillaries - $BTD Step', () => {
  test('auxillaries-btd-first-load', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'wallet', ['profile', 'externals', 'interfaces']);
    await page.reload();
    // Wait for the BTD badge.
    await page.waitForSelector('[data-testid="wallet-step-badge"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-btd-first-load.png');
  });

  test('auxillaries-btd-plan-selected', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'wallet', ['profile', 'externals', 'interfaces']);
    await page.reload();
    // Select a BTD allocation plan.
    const planBtn = page.locator('button:has-text("Mini")').first();
    await planBtn.click();
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-btd-plan-selected.png');
  });

  test('auxillaries-btd-promo-applied', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'wallet', ['profile', 'externals', 'interfaces']);
    await page.reload();
    // Enter promo code
    await page.fill('input.promo-input', 'PROMO123');
    await page.click('button:has-text("Apply")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-btd-promo-applied.png');
  });

  test('auxillaries-btd-chart-intervals', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'wallet', ['profile', 'externals', 'interfaces']);
    await page.reload();
    const intervals = ['daily', 'weekly', 'monthly'];
    for (const intv of intervals) {
      await page.click(`button:has-text("${intv.charAt(0).toUpperCase() + intv.slice(1)}")`);
      await page.waitForTimeout(300);
      expect(await page.screenshot({ fullPage: true }))
        .toMatchSnapshot(`auxillaries-btd-chart-${intv}.png`);
    }
  });
});
