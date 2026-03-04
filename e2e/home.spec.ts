import { test, expect } from "@playwright/test";

test("landing page renders overlay cards", async ({ page }) => {
  await page.goto("/");

  const landingPage = page.locator('[data-testid="landing-page"]');
  await expect(landingPage).toBeVisible({ timeout: 10000 });

  // Should show the title
  await expect(page.locator('[data-testid="landing-title"]')).toHaveText("OmniMap");

  // Should show overlay cards from the plugin registry
  await expect(page.locator('[data-testid="overlay-card-languages"]')).toBeVisible();
});

test("clicking an overlay card navigates to the map", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-testid="landing-page"]')).toBeVisible({ timeout: 10000 });

  // Click the languages card
  await page.locator('[data-testid="overlay-card-languages"]').click();

  // Should navigate to the map page
  await expect(page).toHaveURL(/\/map\?overlay=languages/);

  // Map should render
  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });
});

test("map page renders the Leaflet map", async ({ page }) => {
  await page.goto("/map");

  // Leaflet map container should be present
  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Map should fill the viewport
  const box = await mapContainer.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);

  // Attribution should be visible
  const attribution = page.locator(".leaflet-control-attribution");
  await expect(attribution).toBeVisible();
  await expect(attribution).toContainText("OpenStreetMap");
  await expect(attribution).toContainText("CARTO");
});

test("map supports zoom and pan interactions", async ({ page }) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Zoom controls should be present
  const zoomIn = page.locator(".leaflet-control-zoom-in");
  const zoomOut = page.locator(".leaflet-control-zoom-out");
  await expect(zoomIn).toBeVisible();
  await expect(zoomOut).toBeVisible();

  // Click zoom in and verify it works (no crash)
  await zoomIn.click();
  await expect(mapContainer).toBeVisible();
});
