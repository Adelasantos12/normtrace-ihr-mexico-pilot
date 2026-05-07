import { test, expect } from '@playwright/test';

test('verify Actors Explorer v0.5 fixes', async ({ page }) => {
  await page.goto('/actors');

  // Verify Tabs
  await expect(page.getByRole('button', { name: 'Relationship Map' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Actor Inventory' })).toBeVisible();

  // Verify Relationship Map
  await page.getByRole('button', { name: 'Relationship Map' }).click();
  // Look for SSA in the SVG
  await expect(page.locator('svg').first()).toBeVisible();
  await expect(page.getByText('Legend')).toBeVisible();
  await expect(page.getByText('Legal Relationship Registry')).toBeVisible();

  // Verify Actor Inventory
  await page.getByRole('button', { name: 'Actor Inventory' }).click();
  await expect(page.getByPlaceholder('Search by actor name or ID...')).toBeVisible();

  // Wait for an actor card to appear
  await expect(page.locator('h3').first()).toBeVisible();

  // Check for clean labels (no snake_case)
  // We check for the presence of the label text.
  await expect(page.locator('span').filter({ hasText: 'Legal basis:' }).first()).toBeVisible();

  // Check for developer check
  await expect(page.getByText('Developer data check')).toBeVisible();
});

test('verify Methodology v0.5 fixes', async ({ page }) => {
  await page.goto('/methodology');

  // Verify clean title (no duplication)
  await expect(page.getByRole('heading', { name: 'NormTrace-IHR Methodology', exact: true })).toHaveCount(1);

  // Verify callouts are rendered
  await expect(page.locator('.methodology-callout.important')).toBeVisible();
  await expect(page.getByText('What this methodology solves')).toBeVisible();

  // Verify workflow diagram
  await expect(page.locator('.workflow-container')).toBeVisible();
  await expect(page.getByText('International Instrument', { exact: true })).toBeVisible();
});

test('verify Provisions Explorer hotfix', async ({ page }) => {
  await page.goto('/provisions');

  // Verify that the table is visible (which implies React is defined)
  await expect(page.locator('table')).toBeVisible();

  // Check for some content
  await expect(page.getByText('Norm & Article')).toBeVisible();
});
