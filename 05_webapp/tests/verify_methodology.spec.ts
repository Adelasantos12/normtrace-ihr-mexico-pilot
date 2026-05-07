import { test, expect } from '@playwright/test';

test('verify methodology page', async ({ page }) => {
  await page.goto('http://localhost:5173/methodology');
  await page.waitForSelector('h1');
  // Wait for fetch and render
  await page.waitForSelector('section');
  await page.screenshot({ path: '/home/jules/verification/screenshots/methodology_v1.png', fullPage: true });

  // Check for table presence
  const tableCount = await page.locator('table').count();
  console.log(`Found ${tableCount} tables`);
  expect(tableCount).toBeGreaterThan(0);
});
