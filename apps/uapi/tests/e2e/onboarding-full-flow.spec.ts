import { test, expect } from '@playwright/test';

// Full end-to-end onboarding drive-through
test.describe('Full Onboarding Flow', () => {
  test('should complete profile, connects, interfaces, and btd steps', async ({ page, context }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Stub OTP request and verify
    await context.route(`${supabaseUrl}/auth/v1/otp`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {}, error: null }) })
    );
    await context.route(`${supabaseUrl}/auth/v1/verify`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { session: { user: { id: 'user1' } } }, error: null }) })
    );
    // Navigate to app and open onboarding
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-auxillaries-testid="auxillaries-open-button"]');

    // Profile Step
    await page.waitForSelector('[data-testid="profile-email-input"]');
    await page.fill('[data-testid="profile-email-input"]', 'test@playwright.com');
    await page.click('[data-testid="profile-send-code"]');
    await page.waitForSelector('[data-testid="profile-otp-input"]');
    await page.fill('[data-testid="profile-otp-input"]', '123456');
    await page.click('[data-testid="profile-verify-code"]');
    // Should auto-advance to Connections
    await page.waitForSelector('[data-testid="externals-step-badge"]');
    await expect(page.locator('[data-testid="externals-step-badge"]')).toHaveText('Step 2 of 4');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('onboarding-full-connections.png');

    // Connections Step
    // GitHub connect
    await page.click('[data-testid="externals-github-button"]');
    // Wait for repo chips and items
    await page.waitForSelector('[data-testid="connections-repo-chip-user/repo-1"]');
    await page.waitForSelector('[data-testid="connections-repo-item-user/repo-1"]');
    await page.waitForSelector('[data-testid="interfaces-step-badge"]');
    await expect(page.locator('[data-testid="interfaces-step-badge"]')).toHaveText('Step 3 of 4');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('onboarding-full-models.png');

    // Interfaces step auto-advances.
    // Wait for the BTD step.
    await page.waitForSelector('[data-testid="wallet-step-badge"]');
    await expect(page.locator('[data-testid="wallet-step-badge"]')).toHaveText('Step 4 of 4');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('onboarding-full-btd.png');
  });
});
