import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables to access NEXT_PUBLIC_SUPABASE_URL
dotenv.config({ path: '.env.local' });

test.describe('OTP Authentication Flow', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local');
  }

  test.beforeEach(async ({ context }) => {
    // Stub out OTP request to supabase (sending code)
    await context.route(`${supabaseUrl}/auth/v1/otp`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {}, error: null }),
      })
    );
  });

  test('sends login code and transitions to verify stage', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    // Verify that OTP input appears
    await expect(page.locator('input#otp')).toBeVisible();
    await expect(page.locator('button:has-text("Verify Code")')).toBeVisible();
  });

  test('shows error message on invalid OTP', async ({ page, context }) => {
    // Stub verifyOtp to return an error
    await context.route('**/auth/v1/verify', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { session: null }, error: { message: 'Invalid OTP', status: 400 } }),
      })
    );
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    await page.fill('input#otp', '000000');
    await page.click('button:has-text("Verify Code")');
    // Error text should be visible and remain on verify stage
    await expect(page.locator('text=Invalid OTP')).toBeVisible();
    await expect(page.locator('input#otp')).toBeVisible();
  });
  test('shows error on login code request failure', async ({ page, context }) => {
    // Stub OTP request to return rate-limit error
    await context.route('**/auth/v1/otp', route =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, error: { message: 'Too many requests', status: 429 } }),
      })
    );
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    // Expect error displayed and remain on request stage
    await expect(page.locator('[data-testid="login-error"]')).toHaveText('Too many requests');
    await expect(page.locator('input#otp')).toBeHidden();
  });

  test('completes login successfully with correct OTP', async ({ page, context }) => {
    // Stub verifyOtp to simulate a valid session
    await context.route('**/auth/v1/verify', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            session: {
              access_token: 'fake',
              refresh_token: 'fake',
              expires_in: 3600,
              token_type: 'bearer',
              user: { id: 'playwright-user', aud: 'authenticated', role: 'authenticated' },
            },
          },
          error: null,
        }),
      })
    );
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    await page.fill('input#otp', '123456');
    await page.click('button:has-text("Verify Code")');
    // After successful login, the login modal should close
    await expect(page.locator('input#email')).toBeHidden();
  });

  test('toggles to signup onboarding view', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.click('text=Connect');
    // Should navigate to onboarding profile step
    await expect(page.locator('[data-testid="profile-email-input"]')).toBeVisible();
  });
});