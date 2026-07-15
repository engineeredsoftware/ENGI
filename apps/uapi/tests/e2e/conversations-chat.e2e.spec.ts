import { test, expect } from '@playwright/test';

test.describe('Conversations Chat Sidebars', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Ensure toggle buttons are loaded
    await expect(page.locator('[data-testid="sidebar-toggle-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-toggle-right"]')).toBeVisible();
  });

  test('Left Sidebar: Chat open, history, select chat, send message', async ({ page }) => {
    const toggle = page.locator('[data-testid="sidebar-toggle-left"]');
    const chatSidebar = page.locator('[data-testid="sidebar-chat"]');
    // Initially hidden
    await expect(chatSidebar).toBeHidden();
    // Open chat sidebar
    await toggle.click();
    await expect(chatSidebar).toBeVisible();
    // Chat view shows default header
    await expect(chatSidebar.locator('text=New Chat')).toBeVisible();
    // Open chat history by clicking the header
    await chatSidebar.locator('text=New Chat').click();
    await expect(chatSidebar.locator('text=Chat History')).toBeVisible();
    // History list contains at least one conversation
    const firstChat = chatSidebar.locator('text=Code Refactoring Discussion');
    await expect(firstChat).toBeVisible();
    // Select a conversation
    await firstChat.click();
    // Header updates to selected chat
    await expect(chatSidebar.locator('text=Code Refactoring Discussion')).toBeVisible();
    // Send a new message
    const userMsg = 'Hello Conversations';
    const input = chatSidebar.locator('textarea.rich-text-input');
    await input.fill(userMsg);
    await chatSidebar.locator('button.send-button').click();
    // User message appears
    await expect(chatSidebar.locator(`text=${userMsg}`)).toBeVisible();
    // Agent response appears (simulated)
    await expect(chatSidebar.locator('text=Let me analyze')).toBeVisible({ timeout: 3000 });
    // Close chat sidebar
    await toggle.click();
    await expect(chatSidebar).toBeHidden();
  });
  
  test('Left Sidebar: Chat history grouping by repository and time', async ({ page }) => {
    const toggle = page.locator('[data-testid="sidebar-toggle-left"]');
    const chatSidebar = page.locator('[data-testid="sidebar-chat"]');
    // Open chat sidebar and history
    await toggle.click();
    await chatSidebar.locator('text=New Chat').click();
    // Repository grouping
    await expect(chatSidebar.locator('text=Repositories')).toBeVisible();
    await expect(chatSidebar.locator('text=bitcode-labs/frontend')).toBeVisible();
    await expect(chatSidebar.locator('text=bitcode-labs/backend')).toBeVisible();
    await expect(chatSidebar.locator('text=bitcode-labs/database')).toBeVisible();
    // Time grouping
    await expect(chatSidebar.locator('text=Today')).toBeVisible();
    await expect(chatSidebar.locator('text=Yesterday')).toBeVisible();
    await expect(chatSidebar.locator('text=Previous Seven Days')).toBeVisible();
    // Close chat sidebar
    await toggle.click();
    await expect(chatSidebar).toBeHidden();
  });

  test('Left Sidebar: switch Chat ↔ Feedbacks and navigate feedbacks history', async ({ page }) => {
    const toggle = page.locator('[data-testid="sidebar-toggle-left"]');
    const chatSidebar = page.locator('[data-testid="sidebar-chat"]');
    const feedbacksSidebar = page.locator('[data-testid="sidebar-feedbacks"]');
    // Open chat sidebar
    await toggle.click();
    await expect(chatSidebar).toBeVisible();
    // Switch to feedbacks
    const switchToFeedbacks = page.locator('[data-testid="sidebar-switch-feedbacks"]');
    await switchToFeedbacks.click();
    await expect(chatSidebar).toBeHidden();
    await expect(feedbacksSidebar).toBeVisible();
    // Default view in feedbacks
    await expect(feedbacksSidebar.locator('text=New Chat')).toBeVisible();
    // Open feedbacks history
    await feedbacksSidebar.locator('text=New Chat').click();
    await expect(feedbacksSidebar.locator('text=Chat History')).toBeVisible();
    // Select first feedback conversation
    const firstFeedback = feedbacksSidebar.locator('text=Code Refactoring Discussion');
    await expect(firstFeedback).toBeVisible();
    await firstFeedback.click();
    // Header updates to selected feedback
    await expect(feedbacksSidebar.locator('text=Code Refactoring Discussion')).toBeVisible();
    // Switch back to Chat
    const switchToChat = page.locator('[data-testid="sidebar-switch-chat"]');
    await switchToChat.click();
    await expect(feedbacksSidebar).toBeHidden();
    await expect(chatSidebar).toBeVisible();
    // Chat header resets to default
    await expect(chatSidebar.locator('text=New Chat')).toBeVisible();
    // Close chat sidebar
    await toggle.click();
    await expect(chatSidebar).toBeHidden();
  });
  
  test('Left Sidebar: Feedbacks history grouping by repository and time', async ({ page }) => {
    const toggle = page.locator('[data-testid="sidebar-toggle-left"]');
    const feedbacksSidebar = page.locator('[data-testid="sidebar-feedbacks"]');
    // Open feedbacks sidebar
    await toggle.click();
    await page.locator('[data-testid="sidebar-switch-feedbacks"]').click();
    await expect(feedbacksSidebar).toBeVisible();
    // Open history view
    await feedbacksSidebar.locator('text=New Chat').click();
    // Repository grouping
    await expect(feedbacksSidebar.locator('text=Repositories')).toBeVisible();
    await expect(feedbacksSidebar.locator('text=bitcode-labs/frontend')).toBeVisible();
    await expect(feedbacksSidebar.locator('text=bitcode-labs/backend')).toBeVisible();
    await expect(feedbacksSidebar.locator('text=bitcode-labs/database')).toBeVisible();
    // Time grouping
    await expect(feedbacksSidebar.locator('text=Today')).toBeVisible();
    await expect(feedbacksSidebar.locator('text=Yesterday')).toBeVisible();
    await expect(feedbacksSidebar.locator('text=Previous Seven Days')).toBeVisible();
    // Close feedbacks sidebar
    await toggle.click();
    await expect(feedbacksSidebar).toBeHidden();
  });

  test('Sidebars toggles are hidden on mobile viewport (<768px)', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Sidebar toggles should not be visible
    await expect(page.locator('[data-testid="sidebar-toggle-left"]')).toBeHidden();
    await expect(page.locator('[data-testid="sidebar-toggle-right"]')).toBeHidden();
  });
});
