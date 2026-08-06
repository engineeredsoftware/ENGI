import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test.describe('Profile Flows', () => {
  test('First-time onboarding steps', async ({ page }) => {
    // Trigger dev-mode onboarding
    await page.goto('/?dev=true');
    // Initial onboarding modal
    await page.waitForSelector('span:has-text("Step 1 of 4")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-onboarding-first-load.png');
    // Enter email
    await page.fill('input#email', 'user@playwright.com');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-onboarding-email-entered.png');
    // Send code
    await page.click('button:has-text("Send Code")');
    await page.waitForSelector('input#verificationCode');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-onboarding-otp-input.png');
    // Verify code
    await page.fill('input#verificationCode', '123456');
    await page.click('button:has-text("Verify")');
    await page.waitForSelector('span:has-text("Step 2 of 4")');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-onboarding-verified.png');
  });

  test('Returning user advanced profile view', async ({ page, context }) => {
    const supa = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Stub OTP
    await context.route(`${supa}/auth/v1/otp`, r => r.fulfill({ status:200,contentType:'application/json',body:'{"data":{},"error":null}' }));
    await context.route(`${supa}/auth/v1/verify`, r => r.fulfill({ status:200,contentType:'application/json',body:'{"data":{"session":{"user":{"id":"u1"}}},"error":null}' }));
    // Stub user data with multiple team members
    await context.route('**/api/auxillaries/data', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({
        profile: { user_id: 'u1', username: 'tester', display_name: 'Tester', bio: 'Bio', company_name: 'Acme', avatar_url: '', team_members: [
          { id: 'u1', username: 'tester', displayName: 'Tester', avatarUrl: '', role: 'owner' },
          { id: 'u2', username: 'alice', displayName: 'Alice', avatarUrl: '', role: 'admin' }
        ] },
        githubConnection: { installationId: 42 }, btdBalance: 0, modelPreferences: {}
      })
    }));
    // Connect & open account
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email','user@playwright.com');
    await page.click('button:has-text("Send Code")');
    await page.fill('input#otp','123456');
    await page.click('button:has-text("Verify Code")');
    await page.click('button:has-text("account")');
    // Profile view for returning
    await page.waitForSelector('.orbitals-users-team-management-container');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('profile-returning-advanced.png');
  });
});
