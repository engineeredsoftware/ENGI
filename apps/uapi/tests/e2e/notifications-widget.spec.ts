import { test, expect } from '@playwright/test';

test.describe('Notifications Widget', () => {
  // Stub Supabase getUser so the widget subscribes
  test.beforeEach(async ({ context }) => {
    await context.route('**/auth/v1/user', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { user: { id: 'user-1' } }, error: null }),
      })
    );
  });

  test('no notifications displays empty state', async ({ page, context }) => {
    // Return no notifications
    await context.route('**/api/auxillaries/notifications', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    // Navigate to a page that includes the widget
    await page.goto('/executions?type=agentic-execution:asset-pack');
    // No badge should be shown (no numeric span)
    const badges = await page.locator('span').filter({ hasText: /\d+/ }).count();
    expect(badges).toBe(0);

    // Open the dropdown
    await page.click('button:has(svg)');
    // Should show empty state message
    await expect(page.locator('text=No notifications')).toBeVisible();
  });

  test('renders notifications and triggers mark-read and delete calls', async ({ page, context }) => {
    const notifications = [
      { id: 'n1', user_id: 'user-1', type: 'foo', message: 'Hello', data: {}, read: false, created_at: '2023-01-01T00:00:00Z' },
      { id: 'n2', user_id: 'user-1', type: 'bar', message: 'World', data: {}, read: true,  created_at: '2023-01-02T00:00:00Z' }
    ];
    // Stub initial fetch
    await context.route('**/api/auxillaries/notifications', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(notifications),
      })
    );
    // Stub patch and delete endpoints
    await context.route('**/api/auxillaries/notifications/*', route =>
      route.fulfill({ status: 200 })
    );

    await page.goto('/executions?type=agentic-execution:asset-pack');
    // Badge shows unread count = 1
    await expect(page.locator('text=1')).toBeVisible();

    // Open dropdown
    await page.click('button:has(svg)');
    // Items should be visible
    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('text=World')).toBeVisible();

    // Click 'Read' to mark first as read and capture the PATCH request
    const patchReq = page.waitForRequest(req =>
      req.url().endsWith('/api/auxillaries/notifications/n1') && req.method() === 'PATCH'
    );
    await page.click('button:has-text("Read")');
    const req1 = await patchReq;
    expect(req1.method()).toBe('PATCH');
    expect(req1.postDataJSON()).toEqual({ read: true });

    // Click 'Dismiss' to delete second notification and capture DELETE request
    const deleteReq = page.waitForRequest(req =>
      req.url().endsWith('/api/auxillaries/notifications/n2') && req.method() === 'DELETE'
    );
    await page.click('button:has-text("Dismiss")');
    const req2 = await deleteReq;
    expect(req2.method()).toBe('DELETE');
  });
});
