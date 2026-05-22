const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Home tab shows home content', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      await page.getByRole('button', { name: /Dashboard/ }).click();
    } else {
      await page.locator('.tabbar__btn').filter({ hasText: 'Home' }).click();
    }
    await expect(
      page.getByText('Up next').or(page.getByText('Featured')).or(page.getByText('Dashboard'))
    ).toBeVisible();
  });

  test('Matches tab shows fixtures', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      await page.getByRole('button', { name: /Fixtures/ }).click();
    } else {
      await page.locator('.tabbar__btn').filter({ hasText: 'Matches' }).click();
    }
    await expect(page.getByText('Fixtures')).toBeVisible();
  });

  test('Bracket tab shows tournament', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      await page.getByRole('button', { name: /Bracket/ }).click();
    } else {
      await page.locator('.tabbar__btn').filter({ hasText: 'Bracket' }).click();
    }
    await expect(page.getByText('Tournament')).toBeVisible();
  });

  test('Leaders tab shows leaderboard', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      await page.getByRole('button', { name: /Leaderboard/ }).click();
    } else {
      await page.locator('.tabbar__btn').filter({ hasText: 'Leaders' }).click();
    }
    await expect(page.getByText('Leaderboard')).toBeVisible();
  });

  test('My Bets tab shows bets screen', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      await page.getByRole('button', { name: /My Bets/ }).click();
    } else {
      await page.locator('.tabbar__btn').filter({ hasText: 'My Bets' }).click();
    }
    await expect(page.getByText('My bets').or(page.getByText('My Bets'))).toBeVisible();
  });
});
