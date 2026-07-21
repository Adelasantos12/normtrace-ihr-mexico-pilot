import { test, expect } from '@playwright/test';

test('capture dashboard v5', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForSelector('.text-2xl.font-bold');
  // Wait a bit for charts to animate
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/jules/verification/screenshots/dashboard_v5.png', fullPage: true });
});
