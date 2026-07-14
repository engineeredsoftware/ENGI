import { test, expect } from '@playwright/test';

test.describe('@profile UI Visual - Connect Flows', () => {
  test('login-first-load', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.waitForSelector('[data-testid="login-email-input"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('login-first-load.png');
  });

  test('login-enter-email', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.fill('[data-testid="login-email-input"]', 'user@example.com');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('login-enter-email.png');
  });

  test('login-hover-send-link', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    await page.hover('[data-testid="login-send-code"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('login-hover-send-link.png');
  });

  test('Connect Returning Customer', async ({ page, context }) => {
    // Stub Supabase OTP request
    await context.route('**/auth/v1/otp*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {}, error: null }),
      })
    );
    // Stub Supabase verify OTP
    await context.route('**/auth/v1/verify*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            session: {
              access_token: 'fake-access-token',
              refresh_token: 'fake-refresh-token',
              expires_in: 3600,
              token_type: 'bearer',
              user: { id: 'user-1', aud: 'authenticated', role: 'authenticated', email: 'user@example.com' },
            },
          },
          error: null,
        }),
      })
    );
    // Stub Supabase getUser
    await context.route('**/auth/v1/user*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { user: { id: 'user-1', email: 'user@example.com' } },
          error: null,
        }),
      })
    );
    // Stub notifications API
    await context.route('**/api/auxillaries/notifications', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'n1', user_id: 'user-1', type: 'info', message: 'Welcome back!', data: {}, read: false, created_at: '2023-01-01T00:00:00Z' },
          { id: 'n2', user_id: 'user-1', type: 'alert', message: 'Subscription expires soon', data: {}, read: true, created_at: '2023-01-02T00:00:00Z' },
        ]),
      })
    );
    // Navigate to the Bitcode Terminal review surface.
    await page.goto('/packs?transactionId=test-run');
    // Open login modal
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');
    // Enter email and send code
    await page.fill('[data-testid="login-email-input"]', 'user@example.com');
    await page.click('[data-testid="login-send-code"]');
    // Enter verification code and verify
    await page.waitForSelector('[data-testid="login-otp-input"]');
    await page.fill('[data-testid="login-otp-input"]', '123456');
    await page.click('[data-testid="login-verify-code"]');
    await page.waitForURL('**/packs?transactionId=test-run');
    // Open notifications dropdown
    const notifButton = page.locator('[data-testid="notifications-toggle"]');
    await notifButton.click();
    // Wait for unread notification message
    await page.waitForSelector('text=Welcome back!');
    // Capture full-page visual snapshot
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('login-connect-returning-customer.png');
  });
});
