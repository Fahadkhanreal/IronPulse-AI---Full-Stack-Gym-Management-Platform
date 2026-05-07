import { test, expect } from '@playwright/test';

test.describe('Chat Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');
  });

  test('should display chat widget button', async ({ page }) => {
    // Check if chat widget button is visible
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();
  });

  test('should open chat window when widget clicked', async ({ page }) => {
    // Click the chat widget button
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await chatButton.click();

    // Check if chat window appears
    await expect(page.locator('text=GymBuddy AI')).toBeVisible();

    // Check for greeting message
    await expect(page.locator('text=/How can I help you today/i')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await chatButton.click();

    // Type message
    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    await input.fill('What are your gym timings?');

    // Send message
    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Check user message appears
    await expect(page.locator('text=What are your gym timings?')).toBeVisible();

    // Wait for response (with streaming)
    await page.waitForTimeout(5000); // Wait for streaming to complete

    // Check that response contains relevant information
    const chatWindow = page.locator('[class*="ChatWindow"]');
    await expect(chatWindow.locator('text=/6.*AM|6:00/i')).toBeVisible({ timeout: 10000 });
    await expect(chatWindow.locator('text=/10.*PM|10:00/i')).toBeVisible();
  });

  test('should display typing indicator while streaming', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();

    // Send message
    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    await input.fill('Tell me about your trainers');
    await page.locator('button[aria-label="Send message"]').click();

    // Check for typing indicator or loading state
    await expect(page.locator('text=/Typing|Thinking/i')).toBeVisible({ timeout: 2000 });
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();

    // Send first message
    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    await input.fill('What are your gym timings?');
    await page.locator('button[aria-label="Send message"]').click();
    await page.waitForTimeout(5000);

    // Send second message
    await input.fill('What membership plans do you offer?');
    await page.locator('button[aria-label="Send message"]').click();
    await page.waitForTimeout(5000);

    // Both messages should be visible
    await expect(page.locator('text=What are your gym timings?')).toBeVisible();
    await expect(page.locator('text=What membership plans do you offer?')).toBeVisible();
  });

  test('should close chat window', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();
    await expect(page.locator('text=GymBuddy AI')).toBeVisible();

    // Close chat
    const closeButton = page.locator('button[aria-label="Close chat"]');
    await closeButton.click();

    // Chat window should be hidden
    await expect(page.locator('text=GymBuddy AI')).not.toBeVisible();
  });

  test('should clear chat history', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();

    // Send message
    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    await input.fill('What are your gym timings?');
    await page.locator('button[aria-label="Send message"]').click();
    await page.waitForTimeout(5000);

    // Clear chat
    await page.locator('text=Clear chat').click();

    // Only greeting message should remain
    await expect(page.locator('text=What are your gym timings?')).not.toBeVisible();
    await expect(page.locator('text=/How can I help you today/i')).toBeVisible();
  });

  test('should render markdown in responses', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();

    // Send message that typically gets markdown response
    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    await input.fill('What membership plans do you offer?');
    await page.locator('button[aria-label="Send message"]').click();
    await page.waitForTimeout(5000);

    // Check for markdown elements (lists, bold text, etc.)
    const chatWindow = page.locator('[class*="ChatWindow"]');
    const hasMarkdown = await chatWindow.locator('strong, ul, ol, li').count();
    expect(hasMarkdown).toBeGreaterThan(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Chat button should still be visible
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();

    // Open chat
    await chatButton.click();

    // Chat window should adapt to mobile size
    const chatWindow = page.locator('text=GymBuddy AI').locator('..');
    await expect(chatWindow).toBeVisible();
  });

  test('should handle error gracefully', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();

    // Send empty message (should be prevented by UI)
    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeDisabled();
  });

  test('should show error message on API failure', async ({ page }) => {
    // Intercept API call and return error
    await page.route('**/api/v1/chat/non-stream', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        }),
      });
    });

    // Open chat and send message
    await page.locator('button[aria-label="Open chat"]').click();
    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    await input.fill('What are your gym timings?');
    await page.locator('button[aria-label="Send message"]').click();

    // Error message should appear
    await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should persist chat widget across page navigation', async ({ page }) => {
    // Open chat on homepage
    await page.locator('button[aria-label="Open chat"]').click();
    await expect(page.locator('text=GymBuddy AI')).toBeVisible();

    // Navigate to another page
    await page.goto('http://localhost:3000/plans');

    // Chat widget should still be visible
    await expect(page.locator('button[aria-label="Close chat"]')).toBeVisible();
  });

  test('should handle rapid message sending', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();

    const input = page.locator('textarea[placeholder*="Ask me anything"]');
    const sendButton = page.locator('button[aria-label="Send message"]');

    // Send multiple messages rapidly
    for (let i = 0; i < 3; i++) {
      await input.fill(`Test message ${i + 1}`);
      await sendButton.click();
      await page.waitForTimeout(500);
    }

    // All messages should be queued and processed
    await expect(page.locator('text=Test message 1')).toBeVisible();
    await expect(page.locator('text=Test message 2')).toBeVisible();
    await expect(page.locator('text=Test message 3')).toBeVisible();
  });
});
