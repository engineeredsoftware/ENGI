import { test, expect } from '@playwright/test';

test.describe('@profile UI Visual - Account Profile Onboarding', () => {
  test('account-profile-onboarding-first-load', async ({ page }) => {
    // Dev mode triggers onboarding
    // Navigate to app and open onboarding modal
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Wait for onboarding profile step badge
    await page.waitForSelector('[data-testid="profile-step-badge"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('account-profile-onboarding-first-load.png');
  });
});
