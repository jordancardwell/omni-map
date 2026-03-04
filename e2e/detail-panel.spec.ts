import { test, expect } from "@playwright/test";

test("clicking overlay region opens detail panel with correct data", async ({
  page,
}) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English on to create an overlay
  await page.locator('[data-testid="sidebar-item-en"]').click();

  // Wait for overlay paths to appear
  const overlayPaths = page.locator("path.overlay-en");
  await expect(overlayPaths.first()).toBeAttached({ timeout: 5000 });

  // Click on the overlay path
  await overlayPaths.first().click();

  // Detail panel should appear with English data
  const panel = page.locator('[data-testid="detail-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  await expect(page.locator('[data-testid="detail-panel-title"]')).toHaveText(
    "English"
  );
  await expect(
    page.locator('[data-testid="field-family"]')
  ).toContainText("Indo-European");
  await expect(
    page.locator('[data-testid="field-branch"]')
  ).toContainText("Germanic");
  await expect(
    page.locator('[data-testid="field-writingSystem"]')
  ).toContainText("Latin");
  await expect(
    page.locator('[data-testid="field-endangermentStatus"]')
  ).toContainText("safe");
  await expect(
    page.locator('[data-testid="field-description"]')
  ).not.toBeEmpty();
});

test("clicking sidebar info button opens detail panel", async ({ page }) => {
  await page.goto("/map");

  const sidebar = page.locator('[data-testid="generic-sidebar"]');
  await expect(sidebar).toBeVisible({ timeout: 10000 });

  // Click the info button for English
  await page.locator('[data-testid="sidebar-info-en"]').click();

  // Detail panel should appear
  const panel = page.locator('[data-testid="detail-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  await expect(page.locator('[data-testid="detail-panel-title"]')).toHaveText(
    "English"
  );
});

test("detail panel close button dismisses the panel", async ({ page }) => {
  await page.goto("/map");

  await page
    .locator('[data-testid="generic-sidebar"]')
    .waitFor({ timeout: 10000 });

  // Open detail panel via sidebar info button
  await page.locator('[data-testid="sidebar-info-en"]').click();
  await expect(
    page.locator('[data-testid="detail-panel"]')
  ).toBeVisible({ timeout: 3000 });

  // Click close button
  await page.locator('[data-testid="detail-panel-close"]').click();

  // Panel should be gone
  await expect(
    page.locator('[data-testid="detail-panel"]')
  ).not.toBeVisible();
});
