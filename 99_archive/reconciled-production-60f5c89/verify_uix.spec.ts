import { test, expect } from '@playwright/test';

test('Verify Dashboard UIX improvements', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  // Wait for the loader to disappear
  await page.waitForSelector('.lucide-loader-circle', { state: 'hidden', timeout: 60000 });
  // Wait for the specific metric card
  await page.waitForSelector('text=IHR Obligations', { timeout: 30000 });
  // Extra wait for charts
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/home/jules/verification/screenshots/dashboard_v4.png', fullPage: true });
});
