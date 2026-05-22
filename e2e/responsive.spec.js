const { test, expect } = require('@playwright/test');

test.describe('Responsive layout', () => {
  test('mobile viewport shows bottom TabBar', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop', 'Mobile-only test');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.tabbar')).toBeVisible();
  });

  test('desktop viewport shows sidebar', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'Desktop-only test');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.desk-sidebar')).toBeVisible();
  });

  test('mobile does not show sidebar', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop', 'Mobile-only test');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.desk-sidebar')).not.toBeVisible();
  });

  test('desktop does not show mobile tabbar', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'Desktop-only test');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.tabbar')).not.toBeVisible();
  });
});
