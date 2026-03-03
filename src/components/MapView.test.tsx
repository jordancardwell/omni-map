import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FeatureCollection } from "geojson";

const mockContainer = document.createElement("div");
mockContainer.getBoundingClientRect = () =>
  ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;

const mockMap = {
  hasLayer: vi.fn(() => true),
  removeLayer: vi.fn(),
  latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 200 })),
  getContainer: vi.fn(() => mockContainer),
  containerPointToLatLng: vi.fn(() => ({ lat: 51, lng: -1 })),
};

// Store registered event handlers so tests can invoke them
const layerEventHandlers: Record<string, (e: unknown) => void> = {};

const mockLayerInstance = {
  addTo: vi.fn(function (this: typeof mockLayerInstance) {
    return this;
  }),
  eachLayer: vi.fn(),
  on: vi.fn((event: string, handler: (e: unknown) => void) => {
    layerEventHandlers[event] = handler;
    return mockLayerInstance;
  }),
};

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    className,
    "data-testid": testId,
  }: {
    children: React.ReactNode;
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={testId} className={className}>
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }: { url: string; attribution: string }) => (
    <div
      data-testid="tile-layer"
      data-url={url}
      data-attribution={attribution}
    />
  ),
  useMap: () => mockMap,
}));

vi.mock("leaflet", () => ({
  default: {
    geoJSON: vi.fn(() => mockLayerInstance),
    point: vi.fn((x: number, y: number) => ({ x, y })),
  },
}));

import MapView from "./MapView";
import type { LanguageOverlay } from "./MapView";

const mockGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { code: "en", name: "English", region: "United Kingdom" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6, 50],
            [2, 50],
            [2, 56],
            [-6, 56],
            [-6, 50],
          ],
        ],
      },
    },
  ],
};

describe("MapView", () => {
  it("renders the map container", () => {
    const { getByTestId } = render(<MapView />);
    expect(getByTestId("map-container")).toBeInTheDocument();
  });

  it("uses dark CartoDB tiles", () => {
    const { getByTestId } = render(<MapView />);
    const tileLayer = getByTestId("tile-layer");
    expect(tileLayer.dataset.url).toContain("cartocdn.com/dark_all");
  });

  it("includes proper attribution", () => {
    const { getByTestId } = render(<MapView />);
    const tileLayer = getByTestId("tile-layer");
    expect(tileLayer.dataset.attribution).toContain("OpenStreetMap");
    expect(tileLayer.dataset.attribution).toContain("CARTO");
  });

  it("renders without overlays by default", () => {
    const { getByTestId } = render(<MapView />);
    const styleEl = getByTestId("overlay-glow-styles");
    expect(styleEl.textContent).toBe("");
  });
});

describe("GlowOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds GeoJSON layer to map when overlay is provided", async () => {
    const L = (await import("leaflet")).default;
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
    ];

    await act(async () => {
      render(<MapView overlays={overlays} />);
    });

    expect(L.geoJSON).toHaveBeenCalledWith(mockGeoJson, expect.any(Object));
    expect(mockLayerInstance.addTo).toHaveBeenCalledWith(mockMap);
  });

  it("adds multiple GeoJSON layers for multiple overlays", async () => {
    const L = (await import("leaflet")).default;
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
      { code: "zh", data: mockGeoJson, color: "#E74C3C" },
    ];

    await act(async () => {
      render(<MapView overlays={overlays} />);
    });

    expect(L.geoJSON).toHaveBeenCalledTimes(2);
    expect(mockLayerInstance.addTo).toHaveBeenCalledTimes(2);
  });

  it("removes overlay layer after fade-out delay on unmount", async () => {
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    await act(async () => {
      result!.unmount();
    });

    // Fade-out triggers eachLayer for opacity change
    expect(mockLayerInstance.eachLayer).toHaveBeenCalled();

    // Layer not yet removed (waiting for fade-out)
    expect(mockMap.removeLayer).not.toHaveBeenCalled();

    // After fade duration, layer is removed
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(mockMap.removeLayer).toHaveBeenCalledWith(mockLayerInstance);
  });

  it("generates glow CSS with drop-shadow for overlays", async () => {
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    const styleEl = result!.getByTestId("overlay-glow-styles");
    expect(styleEl.textContent).toContain(".overlay-en");
    expect(styleEl.textContent).toContain("drop-shadow");
    expect(styleEl.textContent).toContain("#4A90D9");
  });

  it("removes glow CSS when overlay is removed", async () => {
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    await act(async () => {
      result!.rerender(<MapView overlays={[]} />);
    });

    const styleEl = result!.getByTestId("overlay-glow-styles");
    expect(styleEl.textContent).not.toContain(".overlay-en");
  });

  it("generates distinct glow CSS for multiple overlays", async () => {
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
      { code: "zh", data: mockGeoJson, color: "#E74C3C" },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    const styleEl = result!.getByTestId("overlay-glow-styles");
    expect(styleEl.textContent).toContain(".overlay-en");
    expect(styleEl.textContent).toContain("#4A90D9");
    expect(styleEl.textContent).toContain(".overlay-zh");
    expect(styleEl.textContent).toContain("#E74C3C");
  });
});

describe("LanguageTooltip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stored event handlers
    Object.keys(layerEventHandlers).forEach((k) => delete layerEventHandlers[k]);
  });

  it("renders tooltip with correct data on mouseover", async () => {
    const overlays: LanguageOverlay[] = [
      {
        code: "zh",
        data: mockGeoJson,
        color: "#E74C3C",
        name: "Mandarin Chinese",
        nativeName: "\u666E\u901A\u8BDD",
        family: "Sino-Tibetan",
        totalSpeakers: 1100000000,
      },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    // Tooltip should not be visible initially
    expect(result!.queryByTestId("language-tooltip")).not.toBeInTheDocument();

    // Simulate mouseover event
    await act(async () => {
      layerEventHandlers["mouseover"]?.({ latlng: { lat: 35, lng: 105 } });
    });

    // Tooltip should now be visible with correct content
    const tooltip = result!.getByTestId("language-tooltip");
    expect(tooltip).toBeInTheDocument();

    expect(result!.getByTestId("tooltip-name").textContent).toBe(
      "Mandarin Chinese"
    );
    expect(result!.getByTestId("tooltip-native-name").textContent).toBe(
      "\u666E\u901A\u8BDD"
    );
    expect(result!.getByTestId("tooltip-speakers").textContent).toContain(
      "1.1B"
    );
    expect(result!.getByTestId("tooltip-family").textContent).toBe(
      "Sino-Tibetan"
    );
  });

  it("hides tooltip on mouseout", async () => {
    const overlays: LanguageOverlay[] = [
      {
        code: "en",
        data: mockGeoJson,
        color: "#4A90D9",
        name: "English",
        nativeName: "English",
        family: "Indo-European",
        totalSpeakers: 1500000000,
      },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    // Trigger mouseover
    await act(async () => {
      layerEventHandlers["mouseover"]?.({ latlng: { lat: 51, lng: -1 } });
    });
    expect(result!.getByTestId("language-tooltip")).toBeInTheDocument();

    // Trigger mouseout
    await act(async () => {
      layerEventHandlers["mouseout"]?.({});
    });
    expect(result!.queryByTestId("language-tooltip")).not.toBeInTheDocument();
  });

  it("does not show native name when it matches the name", async () => {
    const overlays: LanguageOverlay[] = [
      {
        code: "en",
        data: mockGeoJson,
        color: "#4A90D9",
        name: "English",
        nativeName: "English",
        family: "Indo-European",
        totalSpeakers: 1500000000,
      },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    await act(async () => {
      layerEventHandlers["mouseover"]?.({ latlng: { lat: 51, lng: -1 } });
    });

    expect(result!.getByTestId("tooltip-name").textContent).toBe("English");
    expect(result!.queryByTestId("tooltip-native-name")).not.toBeInTheDocument();
  });

  it("tooltip has correct z-index and role attributes", async () => {
    const overlays: LanguageOverlay[] = [
      {
        code: "en",
        data: mockGeoJson,
        color: "#4A90D9",
        name: "English",
        nativeName: "English",
        family: "Indo-European",
        totalSpeakers: 1500000000,
      },
    ];

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<MapView overlays={overlays} />);
    });

    await act(async () => {
      layerEventHandlers["mouseover"]?.({ latlng: { lat: 51, lng: -1 } });
    });

    const tooltip = result!.getByTestId("language-tooltip");
    expect(tooltip.getAttribute("role")).toBe("tooltip");
    expect(tooltip.style.zIndex).toBe("1000");
    expect(tooltip.style.pointerEvents).toBe("none");
  });
});
