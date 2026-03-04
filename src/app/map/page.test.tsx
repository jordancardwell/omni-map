import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockReplace = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const DynamicComponent = () => <div data-testid="map-container" />;
    DynamicComponent.displayName = "DynamicComponent";
    return DynamicComponent;
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("@/generated/plugin-registry.json", () => ({
  default: [
    {
      id: "languages",
      name: "World Languages",
      description: "Geographic regions of world languages",
      type: "regions",
      version: "1.0.0",
      icon: "globe",
      defaultColor: "#4A90D9",
      categories: ["linguistics"],
      dataType: "regions",
      dataSource: "static",
      category: "linguistics",
      thumbnail: "#4A90D9",
      schema: "LanguageMetadata",
      sidebarConfig: {
        idField: "code",
        searchFields: ["name", "nativeName", "family"],
        groupBy: "family",
        titleField: "name",
        subtitleField: "nativeName",
        badgeField: "speakers.total",
        badgeFormat: "formatted-number",
      },
      detailPanelConfig: {
        titleField: "name",
        subtitleField: "nativeName",
      },
      detailFields: [
        { key: "family", label: "Language Family", type: "text" },
        { key: "description", label: "Description", type: "markdown" },
      ],
    },
  ],
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

import MapPage from "./page";

const mockGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { code: "en", name: "English", region: "GB" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    },
  ],
};

describe("MapPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
  });

  it("renders a header with back button linking to landing page", () => {
    render(<MapPage />);
    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute("href", "/");
    expect(screen.getByTestId("map-header")).toBeInTheDocument();
  });

  it("renders the map container", () => {
    render(<MapPage />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders a full-screen main element", () => {
    const { container } = render(<MapPage />);
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main?.className).toContain("h-screen");
    expect(main?.className).toContain("w-screen");
  });

  it("renders the generic sidebar", () => {
    render(<MapPage />);
    expect(screen.getByTestId("generic-sidebar")).toBeInTheDocument();
  });

  it("renders the sidebar search input", () => {
    render(<MapPage />);
    expect(screen.getByTestId("sidebar-search")).toBeInTheDocument();
  });

  it("does not fetch GeoJSON on initial render (lazy-loading)", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<MapPage />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches GeoJSON when an item is toggled on", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockGeoJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const user = userEvent.setup();

    render(<MapPage />);
    expect(fetchSpy).not.toHaveBeenCalled();

    const toggleButton = screen.getByTestId("sidebar-toggle-en");
    await user.click(toggleButton);

    expect(fetchSpy).toHaveBeenCalled();
  });

  it("does not re-fetch GeoJSON when toggling off and on again", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockGeoJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const user = userEvent.setup();

    render(<MapPage />);

    const toggleButton = screen.getByTestId("sidebar-toggle-en");

    await user.click(toggleButton);
    const firstCallCount = fetchSpy.mock.calls.length;

    await user.click(toggleButton);
    expect(fetchSpy.mock.calls.length).toBe(firstCallCount);

    await user.click(toggleButton);
    expect(fetchSpy.mock.calls.length).toBe(firstCallCount);
  });

  it("pre-selects overlay from legacy query param", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockGeoJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    vi.mocked(await import("next/navigation")).useSearchParams = () =>
      new URLSearchParams("overlay=en") as ReturnType<
        typeof import("next/navigation").useSearchParams
      >;

    const { unmount } = render(<MapPage />);
    expect(globalThis.fetch).toHaveBeenCalled();
    unmount();
  });

  it("pre-selects multiple overlays from overlays query param", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockGeoJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    vi.mocked(await import("next/navigation")).useSearchParams = () =>
      new URLSearchParams("overlays=en") as ReturnType<
        typeof import("next/navigation").useSearchParams
      >;

    const { unmount } = render(<MapPage />);
    expect(globalThis.fetch).toHaveBeenCalled();
    unmount();
  });
});
