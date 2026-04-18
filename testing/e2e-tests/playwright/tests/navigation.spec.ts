import { test, expect } from '@playwright/test';

// ─── Navigation & Layout E2E Tests ──────────────────────────────
// Tests global layout elements that appear on every page:
// navbar, footer, responsive behaviour, and critical links.
//
// Prerequisites: `pnpm dev` must be running (Next.js on :3000).
//
// NOTE: The marketplace layout uses a <header> component with the
// U-Shop logo and navigation. Auth pages use their own layout
// without the marketplace header/footer.

test.describe('Global Navigation', () => {
  test('the navbar is visible on the homepage', async ({ page }) => {
    await page.goto('/');

    // Navbar should contain the U-Shop brand — the header element
    const navbar = page.locator('header');
    await expect(navbar.first()).toBeVisible();
  });

  test('navbar contains the U-Shop brand text', async ({ page }) => {
    await page.goto('/');

    // The logo is text-based: a red "U" box + "shop" text span
    const brandText = page.locator('header').getByText('shop');
    await expect(brandText.first()).toBeVisible();
  });
});

test.describe('Responsive Layout', () => {
  test('the page renders correctly on mobile viewport', async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // The page should still render without horizontal overflow
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check that the body width doesn't exceed the viewport
    const bodyBox = await body.boundingBox();
    expect(bodyBox).not.toBeNull();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('the page renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Critical Pages Load Without Errors', () => {
  // These are smoke tests — they just verify each page loads without
  // throwing a React error boundary or returning a server error.
  //
  // NOTE: /stores may return 404 if the API is not seeded with data,
  // so we only test the pages that are statically renderable.

  const publicPages = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/search',
  ];

  for (const path of publicPages) {
    test(`${path} loads without errors`, async ({ page }) => {
      const response = await page.goto(path);

      // The page should return an HTTP 200 (or 304 for cached)
      expect(response?.status()).toBeLessThan(400);

      // No error boundary / "Application error" text
      const errorBoundary = page.getByText(/application error|something went wrong/i);
      await expect(errorBoundary).not.toBeVisible();
    });
  }
});
