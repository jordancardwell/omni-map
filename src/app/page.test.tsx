import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/dynamic", () => ({
  default: () => {
    const DynamicComponent = () => <div data-testid="map-container" />;
    DynamicComponent.displayName = "DynamicComponent";
    return DynamicComponent;
  },
}));

vi.mock("@/generated/language-registry.json", () => ({
  default: [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      family: "Indo-European",
      branch: "Germanic",
      speakers: { native: 380000000, total: 1500000000, source: "test" },
      regions: ["GB"],
      writingSystem: "Latin",
      dialects: [],
      endangermentStatus: "safe",
      description: "",
      historicalNotes: "",
      relatedLanguages: [],
      resources: [],
      geojson: "en.geojson",
    },
  ],
}));

import Home from "./page";

const mockGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { code: "en", name: "English", region: "GB" },
      geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
    },
  ],
};

describe("Home", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the map container", () => {
    render(<Home />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders a full-screen main element", () => {
    const { container } = render(<Home />);
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main?.className).toContain("h-screen");
    expect(main?.className).toContain("w-screen");
  });

  it("renders the language sidebar", () => {
    render(<Home />);
    expect(screen.getByTestId("language-sidebar")).toBeInTheDocument();
  });

  it("renders the language search input", () => {
    render(<Home />);
    expect(screen.getByTestId("language-search")).toBeInTheDocument();
  });

  it("does not fetch GeoJSON on initial render (lazy-loading)", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<Home />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches GeoJSON only when a language is toggled on", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockGeoJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const user = userEvent.setup();

    render(<Home />);
    expect(fetchSpy).not.toHaveBeenCalled();

    const toggleButton = screen.getByTestId("language-toggle-en");
    await user.click(toggleButton);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith("/geo/en.geojson");
  });

  it("does not re-fetch GeoJSON when toggling a language off and on again", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockGeoJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const user = userEvent.setup();

    render(<Home />);

    const toggleButton = screen.getByTestId("language-toggle-en");

    // Toggle on — should fetch
    await user.click(toggleButton);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Toggle off — should not fetch
    await user.click(toggleButton);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Toggle on again — cached, should not re-fetch
    await user.click(toggleButton);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
