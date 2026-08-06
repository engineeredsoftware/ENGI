import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test.describe('User Story: Account Modal Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    const supa = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    await context.route(`${supa}/auth/v1/otp`, route =>
      route.fulfill({ status: 200, body: JSON.stringify({ data: {}, error: null }) })
    );
    await context.route(`${supa}/auth/v1/verify`, route =>
      route.fulfill({ status: 200, body: JSON.stringify({ data: { session: { user: { id: 'user1' } } }, error: null }) })
    );
    await context.route('**/api/auxillaries/data', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        profile: { user_id: 'user1', username: 'tester', display_name: 'Tester', bio: 'Bio', company_name: 'Acme', avatar_url: '', team_members: [] },
        githubConnection: { installationId: 42 }, btdBalance: 100, btcFeeBalance: 0.01, modelPreferences: {}
      }) })
    );
  });

  test('navigate through Profile, Externals, Interfaces, and $BTD', async ({ page }) => {
    await page.goto('/');
    // Connect modal
    await page.click('button:has-text("Connect")');
    await page.waitForSelector('input#email');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('story-profile-login.png');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    await page.fill('input#otp', '123456');
    await page.click('button:has-text("Verify Code")');
    // Open account modal
    await page.click('button:has-text("account")');

    // Profile step
    await page.click('.orbital-label:text("Profile")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('story-profile-profile.png');

    // Connections step
    await page.click('.orbital-label:text("Connections")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('story-profile-connections.png');

    // Interfaces step
    await page.click('.orbital-label:text("Interfaces")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('story-profile-interfaces.png');

    // $BTD step
    await page.click('.orbital-label:text("$BTD")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('story-profile-btd.png');
  });
});
