import { test, expect } from '@playwright/test';

test.describe('OWASP Security Tests @security', () => {
  // Test 1: Broken Access Control - Ensure protected routes require authentication
  test('should prevent access to dashboard without login', async ({ page }) => {
    await page.goto('/dashboard');
    // Expect to be redirected to the login page
    await expect(page).toHaveURL('/login');
  });

  // Test 2: Cross-Site Scripting (XSS) - Attempt to inject a script
  test('should prevent XSS via expense description', async ({ page }) => {
    // This test requires authentication to access the new expense page
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/expenses/new');

    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[name="description"]', xssPayload);
    await page.click('button[type="submit"]');

    // After submission, check if the script is rendered inertly or not at all,
    // rather than being executed. A simple check is to see if the text is present.
    // A more robust test would check that it has not been added to the DOM as a script tag.
    const element = page.locator(`text=${xssPayload}`);
    await expect(element).not.toBeVisible();
  });

  // Test 3: SQL Injection - Attempt to bypass login with a simple SQLi payload
  test('should prevent login via SQL injection', async ({ page }) => {
    await page.goto('/login');
    const sqlPayload = "' OR '1'='1' --";
    await page.fill('input[name="email"]', sqlPayload);
    await page.fill('input[name="password"]', 'anypassword');
    await page.click('button[type="submit"]');

    // Expect to remain on the login page with an error, not be redirected
    await expect(page).not.toHaveURL('/dashboard');
    await expect(page).toHaveURL('/login');

    // Check for an error message (specifics might vary based on implementation)
    const errorMessage = page.locator('text=/invalid/i');
    await expect(errorMessage).toBeVisible();
  });
});
