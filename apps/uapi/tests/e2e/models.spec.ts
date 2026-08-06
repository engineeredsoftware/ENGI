import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

test.describe('Models Configuration in Account Modal', () => {
  test.beforeEach(async ({ context }) => {
    // Stub OTP request
    await context.route(`${supabaseUrl}/auth/v1/otp`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {}, error: null }) })
    );
    // Stub OTP verify
    await context.route(`${supabaseUrl}/auth/v1/verify`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { session: { user: { id: 'user-1' } } }, error: null })
      })
    );
    // Stub user data fetch with model preferences
    await context.route('**/api/auxillaries/data', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: { user_id: 'user-1', username: 'tester' },
          githubConnection: { installationId: 42 },
          btdBalance: 100,
          btcFeeBalance: 0.01,
          modelPreferences: {
            modelCalls: [
              {
                id: 'call1', phase: 'plan', agent: 'agentA', step: 'prepare', failsafe: 'prepare_concise_context', generation: 'reason',
                model: 'gpt-4', systemPrompt: 'Hello AI', fullName: 'Agent Prepare'
              }
            ]
          }
        })
      })
    );
  });

  test('allows changing and saving model and prompt', async ({ page }) => {
    // Connect via OTP
    await page.goto('/');
    await page.click('button:has-text("Connect")');
    await page.fill('input#email', 'test@playwright.com');
    await page.click('button:has-text("Send Connect Code")');
    await page.fill('input#otp', '123456');
    await page.click('button:has-text("Verify Code")');
    // Open account modal
    await page.click('button:has-text("account")');
    // Navigate to Models step via ring or sidebar label
    await page.click('.orbital-label:text("Models")');
    // Wait for the system prompt input
    const textarea = page.locator('textarea#global-system-prompt');
    await expect(textarea).toBeVisible();
    // Change the prompt
    await textarea.fill('Updated prompt for testing');
    // Change the model in the first row dropdown
    const firstSelect = page.locator('select').first();
    await firstSelect.selectOption('gpt-3.5');
    // Intercept save request
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().endsWith('/api/auxillaries/model-preferences') && req.method() === 'POST'),
      page.click('button:has-text("Save Configuration")')
    ]);
    const body = JSON.parse(request.postData() || '{}');
    expect(body).toHaveProperty('modelCalls');
    expect(body.modelCalls[0].model).toBe('gpt-3.5');
    expect(body.modelCalls[0].systemPrompt).toBe('Updated prompt for testing');
  });
});
