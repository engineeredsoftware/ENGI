import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test.describe('Auxillaries - $BTD Chart No-Data States', () => {
  test('auxillaries-btd-chart-weekly-no-data', async ({ page, context }) => {
    // Stub user data and usage API to return no data
    await context.route('**/api/auth/v1/otp', r => r.fulfill({ status:200, body: JSON.stringify({ data:{},error:null }) }));
    await context.route('**/api/auth/v1/verify', r => r.fulfill({ status:200, body: JSON.stringify({ data:{session:{user:{id:'u1'}}}, error:null }) }));
    await context.route('**/api/auxillaries/data', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({
        profile: { user_id: 'u1', username: 'tester' },
        githubConnection: { installationId: 42 }, btdBalance: 0, modelPreferences: {}
      })
    }));
    await context.route('**/api/auxillaries/usage*', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify([])
    }));
    // Open the canonical in-product BTD workspace directly.
    await page.goto('/auxillaries/wallet');
    await page.waitForSelector('span:has-text("Step 4 of 4")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-btd-chart-weekly-no-data.png');
  });
});
