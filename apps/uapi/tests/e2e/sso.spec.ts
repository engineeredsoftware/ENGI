import { test, expect } from '@playwright/test'

// Helper stub that returns a logged-in session object identical to the one
// used in existing OTP tests.
function stubSupabaseSession(context: any) {
  // getUser / getSession both hit the same endpoint in supabase-js v2
  context.route('**/auth/v1/user*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
        error: null,
      }),
    })
  )

  // Token exchange (OAuth) and verifyOtp (magic-link) endpoints – respond with
  // a fake session to satisfy the client.
  context.route('**/auth/v1/token*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: 'user-1', email: 'user@example.com' },
      }),
    })
  )

  context.route('**/auth/v1/verify*', route =>
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
            user: { id: 'user-1', email: 'user@example.com' },
          },
        },
        error: null,
      }),
    })
  )
}

test.describe('@sso flows', () => {
  test.beforeEach(async ({ context }) => {
    stubSupabaseSession(context)
  })

  test('OAuth provider error surfaces toast', async ({ page }) => {
    // Directly hit the callback with an error code – server should redirect
    // to /?connectError=… which the ClientLayout turns into a toast.
    await page.goto('/tps/supabase/callback?error=access_denied&error_description=OAuth%20error')

    // Wait for redirection + toast
    await page.waitForURL(/\/?connectError|\/?loginError/)
    await page.waitForSelector('text=Authentication error')
    await expect(page.locator('text=Authentication error')).toBeVisible()
  })

  test('Magic-link token_hash auto-verification', async ({ page }) => {
    await page.goto('/tps/supabase/callback?token_hash=abc123&next=%2Fterminal')

    await page.waitForURL('**/exchange')
    expect(page.url()).toContain('/exchange')
  })

  test('GitHub OAuth happy path redirects to root', async ({ page }) => {
    await page.goto('/tps/supabase/callback?code=gh123')

    // After polling getSession the client should redirect to '/'
    await page.waitForURL('/');
    expect(page.url().endsWith('/')).toBeTruthy();
  })

  test('Google OAuth happy path with next param', async ({ page }) => {
    await page.goto('/tps/supabase/callback?code=google123&next=%2Fterminal')

    await page.waitForURL('**/exchange')
    expect(page.url()).toContain('/exchange')
  })
})
