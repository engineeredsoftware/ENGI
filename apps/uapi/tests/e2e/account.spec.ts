import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables for Supabase URL
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

test.describe.skip('Account Modal Flow (skipped - focusing on onboarding only)', () => {
  test.beforeEach(async ({ context }) => {
    // Stub OTP request (send code)
    await context.route(`${supabaseUrl}/auth/v1/otp`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {}, error: null })
      })
    );
    // Stub verify OTP (login)
    await context.route(`${supabaseUrl}/auth/v1/verify`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { session: { user: { id: 'user-1' } } },
          error: null
        })
      })
    );
    // Stub user data fetch to include org and repos
    await context.route('**/api/auxillaries/data', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: { user_id: 'user-1', username: 'test' },
          githubConnection: { installationId: 42 },
          btdBalance: 100,
          btcFeeBalance: 0.01,
          modelPreferences: {},
          // Provide orgs and repo arrays for summary
          organizations: ['org1'],
          repositories: ['repo1', 'repo2', 'repo3']
        })
      })
    );
  });

  test('renders GitHub summary after login and opening account modal', async ({ page }) => {
    // Navigate and perform login
    await page.goto('/');
    // Open login modal via connect button
    await page.click('button.neo-signin-btn');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    // Verify stage
    await page.fill('input#otp', '123456');
    await page.click('button:has-text("Verify Code")');
    // After login, click account button
    await page.click('button:has-text("account")');
    // Expect summary card to show organization and repos
    const summary = page.locator('.github-connection-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('org1');
    await expect(summary).toContainText('Connected Repositories (3)');
    await expect(summary).toContainText('repo1');
    await expect(summary).toContainText('repo2');
    await expect(summary).toContainText('repo3');
  });
});
