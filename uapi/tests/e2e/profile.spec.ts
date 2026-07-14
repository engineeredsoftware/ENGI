import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

test.describe('Profile Editing in Account Modal', () => {
  test.beforeEach(async ({ context }) => {
    // Stub OTP send
    await context.route(`${supabaseUrl}/auth/v1/otp`, route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {}, error: null }) }));
    // Stub OTP verify
    await context.route(`${supabaseUrl}/auth/v1/verify`, route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { session: { user: { id: 'user-1' } } }, error: null }) }));
    // Stub initial user data
    await context.route('**/api/auxillaries/data', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile: {
          user_id: 'user-1',
          username: 'init_user',
          display_name: 'Init Name',
          bio: 'Initial Bio',
          company_name: 'Init Co',
          avatar_url: 'http://example.com/init.png',
          team_members: []
        },
        githubConnection: { installationId: 42 },
        btdBalance: 0,
        modelPreferences: {}
      })
    }));
  });

  test('edits and saves profile fields', async ({ page }) => {
    // Perform OTP login
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    await page.fill('input#otp', '123456');
    await page.click('button:has-text("Verify Code")');
    // Open account modal
    await page.click('button:has-text("account")');
    // Select Profile step
    await page.click('.orbital-label:text("Profile")');
    // Fill new values
    await page.fill('input[placeholder="Your name as seen by your team"]', 'New Name');
    await page.fill('textarea[placeholder="Briefly describe your role and expertise"]', 'New Bio');
    await page.fill('input[placeholder="Your organization name"]', 'New Org');
    // Intercept save request
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().endsWith('/api/auxillaries/profile') && req.method() === 'POST'),
      page.click('button:has-text("Save Profile")')
    ]);
    const body = JSON.parse(request.postData() || '{}');
    expect(body.displayName).toBe('New Name');
    expect(body.bio).toBe('New Bio');
    expect(body.companyName).toBe('New Org');
  });
});
