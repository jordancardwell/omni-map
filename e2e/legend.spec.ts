import { test, expect } from "@playwright/test";

test("toggling two languages shows both overlays and the legend", async ({
  page,
}) => {
  await page.goto("/");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Legend should not be visible initially
  await expect(page.locator('[data-testid="overlay-legend"]')).toHaveCount(0);

  // Toggle English on
  await page.locator('[data-testid="language-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  // Legend still not visible with only one overlay
  await expect(page.locator('[data-testid="overlay-legend"]')).toHaveCount(0);

  // Toggle Chinese on
  await page.locator('[data-testid="language-toggle-zh"]').click();
  await expect(
    page.locator("path.overlay-zh").first()
  ).toBeAttached({ timeout: 5000 });

  // Both overlays present simultaneously
  const enCount = await page.locator("path.overlay-en").count();
  const zhCount = await page.locator("path.overlay-zh").count();
  expect(enCount).toBeGreaterThan(0);
  expect(zhCount).toBeGreaterThan(0);

  // Legend should now be visible with both entries
  const legend = page.locator('[data-testid="overlay-legend"]');
  await expect(legend).toBeVisible({ timeout: 2000 });

  await expect(
    page.locator('[data-testid="legend-item-en"]')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="legend-item-zh"]')
  ).toBeVisible();
});

test("clicking a legend item toggles that overlay off", async ({ page }) => {
  await page.goto("/");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle two languages on
  await page.locator('[data-testid="language-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  await page.locator('[data-testid="language-toggle-zh"]').click();
  await expect(
    page.locator("path.overlay-zh").first()
  ).toBeAttached({ timeout: 5000 });

  // Legend visible
  await expect(
    page.locator('[data-testid="overlay-legend"]')
  ).toBeVisible({ timeout: 2000 });

  // Click English legend item to toggle it off
  await page.locator('[data-testid="legend-item-en"]').click();

  // English overlay should be removed (after fade-out)
  await expect(page.locator("path.overlay-en")).toHaveCount(0, {
    timeout: 2000,
  });

  // Legend should disappear since only one overlay remains
  await expect(page.locator('[data-testid="overlay-legend"]')).toHaveCount(0, {
    timeout: 2000,
  });
});
