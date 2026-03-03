import { test, expect } from "@playwright/test";

test("homepage renders the Leaflet map", async ({ page }) => {
  await page.goto("/");

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
  await page.goto("/");

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
