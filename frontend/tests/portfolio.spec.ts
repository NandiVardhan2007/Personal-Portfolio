import { test, expect } from '@playwright/test';

test.describe('Portfolio Site', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kovvuri Nandi Vardhan Reddy/);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Click on Contact in navbar
    const contactLink = page.getByRole('link', { name: 'Contact', exact: true }).first();
    await contactLink.click();
    
    // Verify we're on the contact page
    await expect(page).toHaveURL(/.*\/contact/);
    await expect(page.getByRole('heading', { name: /Contact/i }).first()).toBeVisible();
  });

  test('projects filtering works', async ({ page }) => {
    await page.goto('/projects');
    
    // Check if the "All" category is selected by default
    const allButton = page.getByRole('button', { name: 'All', exact: true });
    await expect(allButton).toHaveClass(/bg-primary/);
    
    // Click a specific category if it exists
    const categories = page.locator('button').filter({ hasNotText: /^All$/ });
    if (await categories.count() > 0) {
      const firstCategory = categories.first();
      await firstCategory.click();
      
      // Verify the class changed
      await expect(firstCategory).toHaveClass(/bg-primary/);
    }
  });
});
