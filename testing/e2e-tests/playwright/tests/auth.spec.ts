import { test, expect } from '@playwright/test';

// ─── Auth Flow E2E Tests ────────────────────────────────────────
// Tests the authentication pages render correctly and have all
// expected interactive elements. These tests verify the frontend
// UI independently of the backend — they check navigation, form
// structure, and client-side validation.
//
// Prerequisites: `pnpm dev` must be running (Next.js on :3000).
//
// NOTE: The login page uses a split-screen layout where the h1
// heading is in the hero section (hidden on smaller viewports).
// The form heading is an h2 ("Welcome Back"). Labels use plain
// <label> elements without htmlFor/id associations, so we locate
// inputs by placeholder text and visible label text instead of
// getByLabel().

test.describe('Login Page', () => {
  test('renders the login form with email and password fields', async ({ page }) => {
    await page.goto('/login');

    // The form heading "Welcome Back" is an h2 inside the card
    await expect(page.getByText('Welcome Back')).toBeVisible();

    // Email input identified by its placeholder text
    await expect(page.getByPlaceholder('student@ug.edu.gh')).toBeVisible();

    // Password input identified by its placeholder text
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();

    // Submit button says "Log In"
    const submitButton = page.getByRole('button', { name: /log in/i });
    await expect(submitButton).toBeVisible();
  });

  test('has a link to the registration page', async ({ page }) => {
    await page.goto('/login');

    // The Login/Sign Up tabs — "Sign Up" is a link to /register
    const signUpTab = page.getByRole('link', { name: /sign up/i });
    await expect(signUpTab).toBeVisible();

    // Also check the footer link "Create an Account"
    const footerLink = page.getByRole('link', { name: /create an account/i });
    await expect(footerLink).toBeVisible();
  });

  test('has a link to the forgot password page', async ({ page }) => {
    await page.goto('/login');

    // The "Forgot Password?" link appears next to the password label
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotLink).toBeVisible();
  });

  test('shows a Google sign-in button', async ({ page }) => {
    await page.goto('/login');

    // Google OAuth button contains an SVG + "Google" text
    const googleBtn = page.getByRole('button', { name: /google/i });
    await expect(googleBtn).toBeVisible();
  });
});

test.describe('Register Page', () => {
  test('renders the registration form', async ({ page }) => {
    await page.goto('/register');

    // The form heading "Create Account" is an h2
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Registration requires Full Name, Email, Password
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Min. 8 characters')).toBeVisible();
  });

  test('has a link back to the login page', async ({ page }) => {
    await page.goto('/register');

    // Footer link "Log in" under "Already have an account?"
    const loginLink = page.getByRole('link', { name: /log in/i });
    await expect(loginLink).toBeVisible();
  });
});

test.describe('Forgot Password Page', () => {
  test('renders with an email input and submit button', async ({ page }) => {
    await page.goto('/forgot-password');

    // The forgot-password page has a proper htmlFor="email" label
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Submit button says "Send Reset Link"
    const submitBtn = page.getByRole('button', { name: /send reset link/i });
    await expect(submitBtn).toBeVisible();
  });
});
