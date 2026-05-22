const { test, expect } = require('@playwright/test');

async function goToLeaders(page, testInfo) {
  if (testInfo.project.name === 'Desktop') {
    await page.getByRole('button', { name: /Leaderboard/ }).click();
  } else {
    await page.locator('.tabbar__btn').filter({ hasText: 'Leaders' }).click();
  }
}

test.describe('Leaderboard screen', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await goToLeaders(page, testInfo);
    await expect(page.getByText('Leaderboard')).toBeVisible();
  });

  test('podium is visible', async ({ page }) => {
    await expect(page.locator('.podium').first()).toBeVisible();
  });

  test('filter chips are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All time' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'This week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
  });

  test('This week chip becomes active on click', async ({ page }) => {
    const chip = page.getByRole('button', { name: 'This week' });
    await chip.click();
    await expect(chip).toHaveClass(/active/);
  });

  test('YOU badge is visible', async ({ page }) => {
    await expect(page.getByText('YOU')).toBeVisible();
  });
});
