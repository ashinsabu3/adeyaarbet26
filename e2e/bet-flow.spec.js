const { test, expect } = require('@playwright/test');

test.describe('Bet flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('full bet flow opens sheet with all elements', async ({ page }, testInfo) => {
    // On desktop, odds buttons only appear when match.odds exists (not in static data)
    // Use hero Bet buttons on desktop, odds-btn on mobile
    if (testInfo.project.name === 'Desktop') {
      // Desktop hero has "Bet XXX" buttons only when odds exist
      // Fall back to navigating to see if any odds-btn exists
      const hasOdds = await page.locator('.odds-btn').first().isVisible().catch(() => false);
      if (!hasOdds) {
        test.skip(true, 'No odds buttons on desktop without match.odds data');
        return;
      }
    }

    await page.locator('.odds-btn').first().click();
    await expect(page.getByText('Place your bet')).toBeVisible();

    // Verify pick buttons exist in the sheet
    await expect(page.locator('.sheet .odds-btn').first()).toBeVisible();

    // Verify amount display
    await expect(page.getByText(/₹\d/)).toBeVisible();

    // Verify slider exists
    await expect(page.locator('input[type="range"]')).toBeVisible();

    // Verify preset buttons
    await expect(page.getByRole('button', { name: '₹500' })).toBeVisible();
  });

  test('preset button updates amount', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      const hasOdds = await page.locator('.odds-btn').first().isVisible().catch(() => false);
      if (!hasOdds) {
        test.skip(true, 'No odds buttons on desktop without match.odds data');
        return;
      }
    }

    await page.locator('.odds-btn').first().click();
    await expect(page.getByText('Place your bet')).toBeVisible();

    // Click ₹500 preset
    await page.getByRole('button', { name: '₹500' }).click();

    // Verify amount display shows 500
    await expect(page.getByText('₹500').first()).toBeVisible();
  });

  test('Place bet button leads to login confirmation', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      const hasOdds = await page.locator('.odds-btn').first().isVisible().catch(() => false);
      if (!hasOdds) {
        test.skip(true, 'No odds buttons on desktop without match.odds data');
        return;
      }
    }

    await page.locator('.odds-btn').first().click();
    await expect(page.getByText('Place your bet')).toBeVisible();

    // Click the Place bet CTA
    await page.getByRole('button', { name: /Place ₹/ }).click();

    // Should show login confirmation (Confirm your identity) or toast
    const loginVisible = await page.getByText('Confirm your identity').isVisible().catch(() => false);
    const toastVisible = await page.getByText(/Bet placed/).isVisible().catch(() => false);

    expect(loginVisible || toastVisible).toBeTruthy();
  });
});
