import { test, expect } from '@playwright/test';

test('opens the dashboard and creates a transaction', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /good to see you/i })).toBeVisible();
  await page.getByRole('button', { name: /add transaction/i }).click();
  await page.locator('input[name="amount"]').fill('42.50');
  await page.locator('select[name="categoryId"]').selectOption({ label: 'Food & groceries' });
  await page.getByRole('button', { name: 'Add transaction' }).last().click();
  await expect(page.getByText('Transaction added.')).toBeVisible();
  await page.reload();
  await page.getByRole('link', { name: /transactions/i }).first().click();
  await expect(page.getByText('Food & groceries')).toBeVisible();
});
