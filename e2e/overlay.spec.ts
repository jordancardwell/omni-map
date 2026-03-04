import { test, expect } from "@playwright/test";

test("toggling a language on renders overlay paths on the map", async ({
  page,
}) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // No overlay paths initially
  await expect(page.locator("path.language-overlay")).toHaveCount(0);

  // Toggle English on
  await page.locator('[data-testid="sidebar-item-en"]').click();

  // Wait for GeoJSON to load and overlay paths to appear
  const overlayPaths = page.locator("path.overlay-en");
  await expect(overlayPaths.first()).toBeAttached({ timeout: 5000 });

  // Verify at least one overlay path exists
  const count = await overlayPaths.count();
  expect(count).toBeGreaterThan(0);
});

test("toggling a language off removes overlay paths from the map", async ({
  page,
}) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English on
  await page.locator('[data-testid="sidebar-item-en"]').click();

  const overlayPaths = page.locator("path.overlay-en");
  await expect(overlayPaths.first()).toBeAttached({ timeout: 5000 });

  // Toggle English off
  await page.locator('[data-testid="sidebar-item-en"]').click();

  // Wait for fade-out (400ms) and removal
  await expect(overlayPaths).toHaveCount(0, { timeout: 2000 });
});

test("multiple languages show overlays with distinct colors simultaneously", async ({
  page,
}) => {
  await page.goto("/map");

  const mapContainer = page.locator(".leaflet-container");
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Toggle English (Indo-European) and Chinese (Sino-Tibetan)
  await page.locator('[data-testid="sidebar-item-en"]').click();
  await expect(
    page.locator("path.overlay-en").first()
  ).toBeAttached({ timeout: 5000 });

  await page.locator('[data-testid="sidebar-item-zh"]').click();
  await expect(
    page.locator("path.overlay-zh").first()
  ).toBeAttached({ timeout: 5000 });

  // Both overlays present simultaneously
  const enCount = await page.locator("path.overlay-en").count();
  const zhCount = await page.locator("path.overlay-zh").count();
  expect(enCount).toBeGreaterThan(0);
  expect(zhCount).toBeGreaterThan(0);

  // Verify glow styles are injected with distinct colors
  const glowStyles = page.locator('[data-testid="overlay-glow-styles"]');
  const css = await glowStyles.textContent();
  expect(css).toContain(".overlay-en");
  expect(css).toContain(".overlay-zh");
});
