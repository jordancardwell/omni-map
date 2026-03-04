import { test, expect } from "@playwright/test";

test.describe("mobile layout", () => {
  test("map fills the full viewport", async ({ page }) => {
    await page.goto("/map");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    const box = await mapContainer.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(viewport.height - 1);
  });

  test("no horizontal scroll on mobile viewport", async ({ page }) => {
    await page.goto("/map");
    await page.locator(".leaflet-container").waitFor({ timeout: 10000 });

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("sidebar starts hidden with hamburger menu visible", async ({
    page,
  }) => {
    await page.goto("/map");
    await page.locator(".leaflet-container").waitFor({ timeout: 10000 });

    // Hamburger toggle should be visible
    const toggle = page.locator('[data-testid="sidebar-toggle"]');
    await expect(toggle).toBeVisible();

    // Hamburger button should have touch-friendly size
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("hamburger opens sidebar and close dismisses it", async ({ page }) => {
    await page.goto("/map");
    await page.locator(".leaflet-container").waitFor({ timeout: 10000 });

    // Open sidebar via hamburger
    await page.locator('[data-testid="sidebar-toggle"]').click();

    // Sidebar should slide in
    const sidebar = page.locator('[data-testid="generic-sidebar"]');
    await expect(sidebar).toBeVisible();

    // Close button should be visible on mobile
    const closeBtn = page.locator('[data-testid="sidebar-close"]');
    await expect(closeBtn).toBeVisible();

    // Close button should have touch-friendly size
    const box = await closeBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Close the sidebar
    await closeBtn.click();

    // Hamburger should reappear
    await expect(page.locator('[data-testid="sidebar-toggle"]')).toBeVisible();
  });

  test("sidebar search and toggle work on mobile", async ({ page }) => {
    await page.goto("/map");
    await page.locator(".leaflet-container").waitFor({ timeout: 10000 });

    // Open sidebar
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await expect(
      page.locator('[data-testid="generic-sidebar"]')
    ).toBeVisible();

    // Search for English
    const searchInput = page.locator('[data-testid="sidebar-search"]');
    await searchInput.fill("English");
    await page.waitForTimeout(500);

    // English should be visible, Mandarin should not
    await expect(
      page.locator('[data-testid="sidebar-item-en"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="sidebar-item-zh"]')
    ).not.toBeVisible();

    // Toggle English on
    await page.locator('[data-testid="sidebar-toggle-en"]').click();
    await expect(
      page.locator('[data-testid="sidebar-active-en"]')
    ).toBeVisible();
  });

  test("detail panel renders as full-screen overlay on mobile", async ({
    page,
  }) => {
    await page.goto("/map");
    await page.locator(".leaflet-container").waitFor({ timeout: 10000 });

    // Open sidebar and trigger detail panel
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await expect(
      page.locator('[data-testid="generic-sidebar"]')
    ).toBeVisible();
    await page.locator('[data-testid="sidebar-info-en"]').click();

    // Detail panel should appear
    const panel = page.locator('[data-testid="detail-panel"]');
    await expect(panel).toBeVisible({ timeout: 3000 });

    // Panel should cover the full viewport on mobile
    const box = await panel.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(viewport.height - 1);

    // Back button should be visible (not close button)
    await expect(
      page.locator('[data-testid="detail-panel-back"]')
    ).toBeVisible();

    // Content should be present
    await expect(
      page.locator('[data-testid="detail-panel-title"]')
    ).toHaveText("English");
  });

  test("detail panel back button dismisses panel on mobile", async ({
    page,
  }) => {
    await page.goto("/map");
    await page.locator(".leaflet-container").waitFor({ timeout: 10000 });

    // Open sidebar and detail panel
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await expect(
      page.locator('[data-testid="generic-sidebar"]')
    ).toBeVisible();
    await page.locator('[data-testid="sidebar-info-en"]').click();
    await expect(
      page.locator('[data-testid="detail-panel"]')
    ).toBeVisible({ timeout: 3000 });

    // Use back button to close
    await page.locator('[data-testid="detail-panel-back"]').click();

    // Panel should be gone
    await expect(
      page.locator('[data-testid="detail-panel"]')
    ).not.toBeVisible();
  });
});
