import { test, expect } from "@playwright/test";

test("sidebar displays language browser with search", async ({ page }) => {
  await page.goto("/");

  const sidebar = page.locator('[data-testid="language-sidebar"]');
  await expect(sidebar).toBeVisible({ timeout: 10000 });

  const searchInput = page.locator('[data-testid="language-search"]');
  await expect(searchInput).toBeVisible();

  await expect(
    page.locator('[data-testid="language-item-en"]')
  ).toBeVisible();
});

test("searching for a language filters the list", async ({ page }) => {
  await page.goto("/");
  await page
    .locator('[data-testid="language-sidebar"]')
    .waitFor({ timeout: 10000 });

  const searchInput = page.locator('[data-testid="language-search"]');
  await searchInput.fill("English");

  // Wait for debounce (300ms) plus rendering
  await page.waitForTimeout(500);

  await expect(
    page.locator('[data-testid="language-item-en"]')
  ).toBeVisible();

  await expect(
    page.locator('[data-testid="language-item-zh"]')
  ).not.toBeVisible();
});

test("toggling a language shows active state in sidebar", async ({ page }) => {
  await page.goto("/");
  await page
    .locator('[data-testid="language-sidebar"]')
    .waitFor({ timeout: 10000 });

  // Click English to toggle it on
  await page.locator('[data-testid="language-item-en"]').click();

  // Should show active indicator
  await expect(
    page.locator('[data-testid="language-active-en"]')
  ).toBeVisible();

  // Click again to toggle off
  await page.locator('[data-testid="language-item-en"]').click();

  // Active indicator should be gone
  await expect(
    page.locator('[data-testid="language-active-en"]')
  ).not.toBeVisible();
});
