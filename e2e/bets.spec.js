const { test, expect } = require('@playwright/test');

async function goToBets(page, testInfo) {
  if (testInfo.project.name === 'Desktop') {
    await page.getByRole('button', { name: /My Bets/ }).click();
  } else {
    await page.locator('.tabbar__btn').filter({ hasText: 'My Bets' }).click({ force: true });
  }
}

test.describe('My Bets screen', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await goToBets(page, testInfo);
    await expect(page.getByText('My bets').or(page.getByText('My Bets'))).toBeVisible();
  });

  test('filter chips are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Open/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Won/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lost/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /All/ }).last()).toBeVisible();
  });

  test('shows bet cards or empty state', async ({ page }) => {
    const hasBets = await page.locator('.bet-card, .desk-bet').first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No .* bets/).isVisible().catch(() => false);
    expect(hasBets || hasEmpty).toBeTruthy();
  });

  test('All chip becomes active on click', async ({ page }) => {
    const allChip = page.getByRole('button', { name: /All/ }).last();
    await allChip.click();
    await expect(allChip).toHaveClass(/active/);
  });
});
