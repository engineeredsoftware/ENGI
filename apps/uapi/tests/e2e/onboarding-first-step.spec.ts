import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

test.describe('Onboarding First Step Flow', () => {
  test('complete profile OTP and advance to connections', async ({ page, context }) => {
    // Stub profile-step OTP endpoints (use wildcard to catch any query params)
    await context.route('**/auth/v1/otp*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {}, error: null })
      })
    );
    await context.route('**/auth/v1/verify*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { session: { user: { id: 'user1' } } }, error: null })
      })
    );

    // Open app and capture initial page load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Screenshot of initial homepage load
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-first-step-page-load.png');
    // Launch onboarding modal via use button
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.waitForSelector('[data-testid="profile-email-input"]');
    // Screenshot after opening onboarding modal
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-first-step-open-modal.png');

    // Profile step OTP request
    await page.waitForSelector('[data-testid="profile-email-input"]');
    await page.fill('[data-testid="profile-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="profile-send-code"]');

    // Profile step OTP verify
    await page.waitForSelector('[data-testid="profile-otp-input"]');
    await page.fill('[data-testid="profile-otp-input"]', '123456');
    await page.click('[data-testid="profile-verify-code"]');

    // Should auto-advance to Connections step
    const connBadge = page.locator('[data-testid="externals-step-badge"]');
    await expect(connBadge).toBeVisible();
    await expect(connBadge).toHaveText('Step 2 of 4');
    // Validate heading for connections step
    await expect(page.locator('h2.step-title')).toContainText('Connect to GitHub');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('onboarding-first-step-flow.png');
  });

  test('shows error on OTP request failure', async ({ page, context }) => {
    // Stub OTP request to return security error
    await context.route('**/auth/v1/otp*', route =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, error: { message: 'For security purposes, please try again later', status: 429 } }),
      })
    );
    // Navigate and open onboarding
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Enter email and attempt to send code
    await page.waitForSelector('[data-testid="profile-email-input"]');
    await page.fill('[data-testid="profile-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="profile-send-code"]');
    // Expect error message displayed
    await page.waitForSelector('[data-testid="profile-error"]');
    await expect(page.locator('[data-testid="profile-error"]')).toHaveText('For security purposes, please try again later');
  });

  test('shows error on OTP verify failure (expired token)', async ({ page, context }) => {
    // Stub OTP request to succeed
    await context.route('**/auth/v1/otp*', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {}, error: null }) })
    );
    // Stub OTP verify to return token expired error
    await context.route('**/auth/v1/verify*', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, error: { message: 'Token expired', status: 400 } }),
      })
    );
    // Navigate and open onboarding
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Enter email and send code
    await page.waitForSelector('[data-testid="profile-email-input"]');
    await page.fill('[data-testid="profile-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="profile-send-code"]');
    // Enter expired OTP
    await page.waitForSelector('[data-testid="profile-otp-input"]');
    await page.fill('[data-testid="profile-otp-input"]', '000000');
    await page.click('[data-testid="profile-verify-code"]');
    // Expect expired token error displayed and remain on verify step
    await page.waitForSelector('[data-testid="profile-error"]');
    await expect(page.locator('[data-testid="profile-error"]')).toHaveText('Token expired');
    await expect(page.locator('[data-testid="profile-otp-input"]')).toBeVisible();
  });
});
