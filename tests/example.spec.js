import { test, expect } from '@playwright/test';

test('should navigate to login page', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*login/);

  await expect(page.getByRole('heading')).toContainText('Welcome Back');
});