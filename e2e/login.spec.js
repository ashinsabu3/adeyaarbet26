const { test, expect } = require('@playwright/test');

test.describe('Login / identity flow', () => {
  test('renders app branding on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('AdeYaar').first()).toBeVisible();
  });

  test('bet sheet login flow shows identity confirmation', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop', 'Desktop has no odds buttons without match.odds data');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Open bet sheet and trigger login
    await page.locator('.odds-btn').first().click();
    await expect(page.getByText('Place your bet')).toBeVisible();
    await page.getByRole('button', { name: /Place ₹/ }).click();
    await expect(page.getByText('Confirm your identity')).toBeVisible();
  });
});
