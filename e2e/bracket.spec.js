const { test, expect } = require('@playwright/test');

async function goToBracket(page, testInfo) {
  if (testInfo.project.name === 'Desktop') {
    await page.getByRole('button', { name: /Bracket/ }).click();
  } else {
    await page.locator('.tabbar__btn').filter({ hasText: 'Bracket' }).click({ force: true });
  }
}

test.describe('Bracket screen', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await goToBracket(page, testInfo);
    await expect(page.getByText('Tournament')).toBeVisible();
  });

  test('group cards are visible', async ({ page }) => {
    await expect(page.getByText('Group A').first()).toBeVisible();
  });

  test('knockout toggle exists and shows bracket rounds', async ({ page }) => {
    const knockoutBtn = page.getByRole('button', { name: /Knockout/ });
    await expect(knockoutBtn).toBeVisible();

    await knockoutBtn.click();
    await expect(page.getByText('Round of 32')).toBeVisible();
    await expect(page.getByText('Round of 16')).toBeVisible();
  });
});
