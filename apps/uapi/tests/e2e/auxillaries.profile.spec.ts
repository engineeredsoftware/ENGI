import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

test.describe('@profile Auxillaries - Profile Step Variations', () => {
  test.beforeEach(async ({ context }) => {
    // Stub OTP send and verify endpoints
    await context.route(`${supabaseUrl}/auth/v1/otp`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {}, error: null }) })
    );
    await context.route(`${supabaseUrl}/auth/v1/verify`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { session: null }, error: { message: 'Invalid OTP', status: 400 } }) })
    );
  });

  test('connect pane first load', async ({ page }) => {
    // Navigate to app and open connect surface
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Wait for login form email input to appear
    await page.waitForSelector('[data-testid="login-email-input"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-login-first-load.png');
  });

  test('connect pane enter email', async ({ page }) => {
    // Navigate to app and open onboarding modal, then switch to login view
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.click('[data-auxillaries-testid="auxillaries-toggle-button"]');
    await page.fill('[data-testid="login-email-input"]', 'test@playwright.com');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-login-enter-email.png');
  });
  
  test('profile-onboarding-otp-input-focused', async ({ page }) => {
    // Navigate to app and open onboarding modal, then switch to login view
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.click('[data-auxillaries-testid="auxillaries-toggle-button"]');
    await page.fill('[data-testid="login-email-input"]', 'test@playwright.com');
    // Send connect code
    await page.click('[data-testid="login-send-code"]');
    // Wait for OTP input to appear and focus it
    await page.waitForSelector('[data-testid="login-otp-input"]');
    await page.click('[data-testid="login-otp-input"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-onboarding-otp-input-focused.png');
  });

  test('profile-onboarding-otp-input-filled', async ({ page }) => {
    // Navigate to app and open onboarding modal, then switch to login view
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.click('[data-auxillaries-testid="auxillaries-toggle-button"]');
    await page.fill('[data-testid="login-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="login-send-code"]');
    await page.waitForSelector('[data-testid="login-otp-input"]');
    // Fill OTP input
    await page.fill('[data-testid="login-otp-input"]', '123456');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-onboarding-otp-input-filled.png');
  });

  test('connect pane invalid OTP error', async ({ page, context }) => {
    // Stub verify to error
    await context.route(`${supabaseUrl}/auth/v1/verify`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { session: null }, error: { message: 'Invalid OTP', status: 400 } }) })
    );
    // Navigate to app and open onboarding modal, then switch to login view
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.click('[data-auxillaries-testid="auxillaries-toggle-button"]');
    await page.fill('[data-testid="login-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="login-send-code"]');
    await page.fill('[data-testid="login-otp-input"]', '000000');
    await page.click('[data-testid="login-verify-code"]');
    await page.waitForSelector('[data-testid="login-error"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-login-invalid-otp.png');
  });

  test('connect pane success transitions to profile', async ({ page, context }) => {
    // Stub verify success
    await context.route(`${supabaseUrl}/auth/v1/verify`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { session: { user: { id: 'user1' } } }, error: null }) })
    );
    // Navigate to app and open onboarding modal, then switch to login view
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.click('[data-auxillaries-testid="auxillaries-toggle-button"]');
    await page.fill('[data-testid="login-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="login-send-code"]');
    await page.fill('[data-testid="login-otp-input"]', '123456');
    await page.click('[data-testid="login-verify-code"]');
    // Profile step should appear
    await page.waitForSelector('[data-testid="profile-step-badge"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-profile-step-initial.png');
  });
});
