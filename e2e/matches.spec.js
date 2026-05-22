const { test, expect } = require('@playwright/test');

async function goToMatches(page, testInfo) {
  if (testInfo.project.name === 'Desktop') {
    await page.getByRole('button', { name: /Fixtures/ }).click();
  } else {
    await page.locator('.tabbar__btn').filter({ hasText: 'Matches' }).click();
  }
}

test.describe('Matches screen', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await goToMatches(page, testInfo);
    await expect(page.getByText('Fixtures')).toBeVisible();
  });

  test('filter chips are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /All/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Live/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Today/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Group/ })).toBeVisible();
  });

  test('Group filter shows match cards', async ({ page }) => {
    await page.getByRole('button', { name: /Group/ }).click();
    // Match cards should be present
    await expect(page.locator('.match-card, .desk-fix').first()).toBeVisible();
  });

  test('match card has odds buttons (mobile)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop', 'Desktop only shows odds when match.odds data exists');
    await expect(page.locator('.odds-btn').first()).toBeVisible();
  });

  test('clicking odds button opens PlaceBetSheet (mobile)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop', 'Desktop only shows odds when match.odds data exists');
    await page.locator('.odds-btn').first().click();
    await expect(page.getByText('Place your bet')).toBeVisible();
  });
});
