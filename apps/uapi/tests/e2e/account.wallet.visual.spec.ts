import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test.describe.skip('@profile UI Visual - Account BTD Flow (skipped - focusing on onboarding only)', () => {
  test('account-btd-massive-balance', async ({ page, context }) => {
    // Stub user data with large BTD balance and usage
    await context.route('**/api/auxillaries/data', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: { user_id: 'u1', username: 'tester' },
          githubConnection: { installationId: 42 },
          btdBalance: 1000000,
          modelPreferences: {},
          organizations: [],
          repositories: []
        })
      })
    );
    // Open the canonical in-product BTD workspace directly.
    await page.goto('/auxillaries/wallet');
    await page.waitForSelector('span:has-text("Step 4 of 4")');
    await page.waitForSelector('canvas'); // usage chart
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('account-btd-massive-balance.png');
  });
});
