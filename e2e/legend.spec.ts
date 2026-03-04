import { test, expect } from "@playwright/test";

test("toggling one language shows the legend with that entry", async ({
  page,
}) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Legend should not be visible initially
  await expect(page.locator('[data-testid="overlay-legend"]')).toHaveCount(0);

  // Toggle English on
  await page.locator('[data-testid="sidebar-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  // Legend should now be visible with one entry
  const legend = page.locator('[data-testid="overlay-legend"]');
  await expect(legend).toBeVisible({ timeout: 2000 });

  await expect(
    page.locator('[data-testid="legend-item-en"]')
  ).toBeVisible();
});

test("toggling two languages shows both overlays and the legend", async ({
  page,
}) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English on
  await page.locator('[data-testid="sidebar-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  // Toggle Chinese on
  await page.locator('[data-testid="sidebar-toggle-zh"]').click();
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
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle two languages on
  await page.locator('[data-testid="sidebar-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  await page.locator('[data-testid="sidebar-toggle-zh"]').click();
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

  // Legend should still be visible since one overlay remains
  await expect(
    page.locator('[data-testid="overlay-legend"]')
  ).toBeVisible({ timeout: 2000 });
});

test("opacity slider adjusts overlay transparency", async ({ page }) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English on
  await page.locator('[data-testid="sidebar-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  // Legend should be visible with opacity slider
  await expect(
    page.locator('[data-testid="overlay-legend"]')
  ).toBeVisible({ timeout: 2000 });

  const slider = page.locator('[data-testid="legend-opacity-en"]');
  await expect(slider).toBeVisible();

  // Change opacity to 50%
  await slider.fill("0.5");

  // Verify opacity value display
  const opacityValue = page.locator('[data-testid="legend-opacity-value-en"]');
  await expect(opacityValue).toHaveText("50%");
});

test("active overlays are reflected in URL query params", async ({ page }) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English on
  await page.locator('[data-testid="sidebar-toggle-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  // URL should reflect the active overlay
  await page.waitForURL(/overlays=en/, { timeout: 3000 });

  // Toggle Chinese on
  await page.locator('[data-testid="sidebar-toggle-zh"]').click();
  await expect(
    page.locator("path.overlay-zh").first()
  ).toBeAttached({ timeout: 5000 });

  // URL should reflect both active overlays
  await page.waitForURL(/overlays=/, { timeout: 3000 });
  const url = new URL(page.url());
  const overlays = url.searchParams.get("overlays")?.split(",").sort();
  expect(overlays).toEqual(["en", "zh"]);
});

test("URL with overlays param restores overlay state on load", async ({
  page,
}) => {
  // Navigate directly with overlays param
  await page.goto("/map?overlays=en,zh");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Both overlays should be loaded
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });
  await expect(
    page.locator("path.overlay-zh").first()
  ).toBeAttached({ timeout: 5000 });

  // Legend should show both entries
  await expect(
    page.locator('[data-testid="legend-item-en"]')
  ).toBeVisible({ timeout: 2000 });
  await expect(
    page.locator('[data-testid="legend-item-zh"]')
  ).toBeVisible({ timeout: 2000 });
});
