import { test, expect } from '@playwright/test';
import { setOnboardingState } from './auxillaries.helpers';

test.describe('Auxillaries - $BTD Interval Button States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set state to the canonical BTD step.
    await setOnboardingState(page, 'wallet', ['profile', 'externals', 'interfaces']);
    await page.reload();
    await page.waitForSelector('span:has-text("Step 4 of 4")');
  });

  for (const intv of ['daily', 'weekly', 'monthly']) {
    test(`auxillaries-btd-interval-${intv}-active`, async ({ page }) => {
      // Click interval toggle
      await page.click(`button:has-text("${intv.charAt(0).toUpperCase() + intv.slice(1)}")`);
      await page.waitForTimeout(300);
      expect(await page.screenshot({ fullPage: true }))
        .toMatchSnapshot(`auxillaries-btd-interval-${intv}-active.png`);
    });
  }
});
