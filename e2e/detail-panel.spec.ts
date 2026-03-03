import { test, expect } from "@playwright/test";

test("clicking overlay region opens detail panel with correct data", async ({
  page,
}) => {
  await page.goto("/");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English on to create an overlay
  await page.locator('[data-testid="language-item-en"]').click();

  // Wait for overlay paths to appear
  const overlayPaths = page.locator("path.overlay-en");
  await expect(overlayPaths.first()).toBeAttached({ timeout: 5000 });

  // Click on the overlay path
  await overlayPaths.first().click();

  // Detail panel should appear with English data
  const panel = page.locator('[data-testid="language-detail-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  await expect(page.locator('[data-testid="detail-panel-name"]')).toHaveText(
    "English"
  );
  await expect(
    page.locator('[data-testid="detail-panel-family"]')
  ).toHaveText("Indo-European");
  await expect(
    page.locator('[data-testid="detail-panel-branch"]')
  ).toHaveText("Germanic");
  await expect(
    page.locator('[data-testid="detail-panel-writing-system"]')
  ).toHaveText("Latin");
  await expect(
    page.locator('[data-testid="detail-panel-endangerment-status"]')
  ).toHaveText("safe");
  await expect(
    page.locator('[data-testid="detail-panel-description"]')
  ).not.toBeEmpty();
});

test("clicking sidebar info button opens detail panel", async ({ page }) => {
  await page.goto("/");

  const sidebar = page.locator('[data-testid="language-sidebar"]');
  await expect(sidebar).toBeVisible({ timeout: 10000 });

  // Click the info button for English
  await page.locator('[data-testid="language-info-en"]').click();

  // Detail panel should appear
  const panel = page.locator('[data-testid="language-detail-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  await expect(page.locator('[data-testid="detail-panel-name"]')).toHaveText(
    "English"
  );
});

test("detail panel close button dismisses the panel", async ({ page }) => {
  await page.goto("/");

  await page
    .locator('[data-testid="language-sidebar"]')
    .waitFor({ timeout: 10000 });

  // Open detail panel via sidebar info button
  await page.locator('[data-testid="language-info-en"]').click();
  await expect(
    page.locator('[data-testid="language-detail-panel"]')
  ).toBeVisible({ timeout: 3000 });

  // Click close button
  await page.locator('[data-testid="detail-panel-close"]').click();

  // Panel should be gone
  await expect(
    page.locator('[data-testid="language-detail-panel"]')
  ).not.toBeVisible();
});
