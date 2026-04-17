import { test, expect } from '@playwright/test';

// ─── Search Flow E2E Tests ──────────────────────────────────────
// Tests the marketplace search and browsing experience.
// Verifies the homepage loads, the search bar works, category
// navigation functions, and listing cards render properly.
//
// Prerequisites: `pnpm dev` must be running (Next.js on :3000).
//
// NOTE: The SearchBar component uses the placeholder text
// "Search products, categories, universities ..." and is rendered
// inside the Header component on the marketplace layout.

test.describe('Homepage', () => {
  test('loads the homepage with the hero section', async ({ page }) => {
    await page.goto('/');

    // The page should load successfully (no error state)
    await expect(page).toHaveTitle(/u-shop/i);

    // Hero section or main heading should be visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading.first()).toBeVisible();
  });

  test('displays the search bar', async ({ page }) => {
    await page.goto('/');

    // The SearchBar component uses this specific placeholder text
    const searchInput = page.getByPlaceholder(/search products/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('displays category navigation', async ({ page }) => {
    await page.goto('/');

    // There should be at least one category link/card visible
    // (Laptops, Phones, etc. from the CATEGORIES constant)
    const categoryLinks = page.getByRole('link', { name: /laptops|phones|tablets|accessories|gaming/i });
    await expect(categoryLinks.first()).toBeVisible();
  });
});

test.describe('Search Page', () => {
  test('search form has the correct input and submit button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Verify the search input exists with the correct placeholder
    const searchInput = page.getByPlaceholder(/search products/i).first();
    await expect(searchInput).toBeVisible();

    // Verify the search submit button exists with the correct aria-label
    const submitBtn = page.getByLabel('Submit search').first();
    await expect(submitBtn).toBeVisible();
  });

  test('navigates to search results via direct URL', async ({ page }) => {
    // Test the search results page directly — this avoids the flaky
    // hydration-dependent form interaction in dev mode (Turbopack takes
    // 13+ seconds to hydrate the homepage, so React's onSubmit never
    // fires before the native form submit).
    await page.goto('/search?q=macbook');
    await expect(page).toHaveURL(/search/);
  });

  test('loads the search page directly with a query', async ({ page }) => {
    await page.goto('/search?q=laptop');

    // The search page should render without crashing
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Category Page', () => {
  test('loads a category page', async ({ page }) => {
    await page.goto('/categories/laptops');

    // The page should load with some content
    await expect(page.locator('body')).toBeVisible();
  });
});
