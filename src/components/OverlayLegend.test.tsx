import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { FeatureCollection } from "geojson";
import OverlayLegend from "./OverlayLegend";
import type { LanguageOverlay } from "./MapView";

const mockGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

function makeOverlay(
  code: string,
  name: string,
  color: string,
  opts?: Partial<LanguageOverlay>
): LanguageOverlay {
  return { code, data: mockGeoJson, color, name, ...opts };
}

const oneOverlay: LanguageOverlay[] = [
  makeOverlay("en", "English", "#4A90D9"),
];

const twoOverlays: LanguageOverlay[] = [
  makeOverlay("en", "English", "#4A90D9", { pluginId: "languages" }),
  makeOverlay("zh", "Mandarin Chinese", "#E74C3C", { pluginId: "languages" }),
];

const threeOverlays: LanguageOverlay[] = [
  ...twoOverlays,
  makeOverlay("es", "Spanish", "#27AE60", { pluginId: "languages" }),
];

const multiPluginOverlays: LanguageOverlay[] = [
  makeOverlay("en", "English", "#4A90D9", { pluginId: "languages" }),
  makeOverlay("temp", "Temperature", "#FF6B6B", { pluginId: "climate" }),
];

describe("OverlayLegend", () => {
  it("does not render when no overlays are active", () => {
    const { container } = render(
      <OverlayLegend overlays={[]} onToggleLanguage={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders legend when 1 overlay is active", () => {
    render(
      <OverlayLegend overlays={oneOverlay} onToggleLanguage={vi.fn()} />
    );
    expect(screen.getByTestId("overlay-legend")).toBeInTheDocument();
  });

  it("renders legend when 2 or more overlays are active", () => {
    render(
      <OverlayLegend overlays={twoOverlays} onToggleLanguage={vi.fn()} />
    );
    expect(screen.getByTestId("overlay-legend")).toBeInTheDocument();
  });

  it("shows correct entries with color swatches and names", () => {
    render(
      <OverlayLegend overlays={twoOverlays} onToggleLanguage={vi.fn()} />
    );

    const enItem = screen.getByTestId("legend-item-en");
    expect(enItem).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();

    const zhItem = screen.getByTestId("legend-item-zh");
    expect(zhItem).toBeInTheDocument();
    expect(screen.getByText("Mandarin Chinese")).toBeInTheDocument();

    const enSwatch = screen.getByTestId("legend-swatch-en");
    expect(enSwatch.style.backgroundColor).toBe("#4A90D9");

    const zhSwatch = screen.getByTestId("legend-swatch-zh");
    expect(zhSwatch.style.backgroundColor).toBe("#E74C3C");
  });

  it("renders all entries for 3+ overlays", () => {
    render(
      <OverlayLegend overlays={threeOverlays} onToggleLanguage={vi.fn()} />
    );

    expect(screen.getByTestId("legend-item-en")).toBeInTheDocument();
    expect(screen.getByTestId("legend-item-zh")).toBeInTheDocument();
    expect(screen.getByTestId("legend-item-es")).toBeInTheDocument();
  });

  it("calls onToggleLanguage with the correct code when remove button is clicked", () => {
    const onToggle = vi.fn();
    render(
      <OverlayLegend overlays={twoOverlays} onToggleLanguage={onToggle} />
    );

    fireEvent.click(screen.getByTestId("legend-item-en"));
    expect(onToggle).toHaveBeenCalledWith("en");

    fireEvent.click(screen.getByTestId("legend-item-zh"));
    expect(onToggle).toHaveBeenCalledWith("zh");
  });

  it("collapses to minimal state and expands back", () => {
    render(
      <OverlayLegend overlays={twoOverlays} onToggleLanguage={vi.fn()} />
    );

    // Legend list should be visible
    expect(screen.getByTestId("legend-list")).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByTestId("legend-collapse"));

    // List should be gone, expand button should show count
    expect(screen.queryByTestId("legend-list")).not.toBeInTheDocument();
    expect(screen.getByTestId("legend-expand")).toHaveTextContent("Legend (2)");

    // Expand back
    fireEvent.click(screen.getByTestId("legend-expand"));
    expect(screen.getByTestId("legend-list")).toBeInTheDocument();
  });

  it("falls back to code when name is not provided", () => {
    const overlays: LanguageOverlay[] = [
      { code: "en", data: mockGeoJson, color: "#4A90D9" },
      { code: "zh", data: mockGeoJson, color: "#E74C3C" },
    ];

    render(
      <OverlayLegend overlays={overlays} onToggleLanguage={vi.fn()} />
    );

    expect(screen.getByText("en")).toBeInTheDocument();
    expect(screen.getByText("zh")).toBeInTheDocument();
  });

  it("renders opacity slider when onChangeOpacity is provided", () => {
    render(
      <OverlayLegend
        overlays={oneOverlay}
        onToggleLanguage={vi.fn()}
        onChangeOpacity={vi.fn()}
      />
    );

    const slider = screen.getByTestId("legend-opacity-en");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "1");
  });

  it("does not render opacity slider when onChangeOpacity is not provided", () => {
    render(
      <OverlayLegend overlays={oneOverlay} onToggleLanguage={vi.fn()} />
    );

    expect(screen.queryByTestId("legend-opacity-en")).not.toBeInTheDocument();
  });

  it("shows correct opacity value as percentage", () => {
    const overlaysWithOpacity: LanguageOverlay[] = [
      makeOverlay("en", "English", "#4A90D9", { opacity: 0.5 }),
    ];

    render(
      <OverlayLegend
        overlays={overlaysWithOpacity}
        onToggleLanguage={vi.fn()}
        onChangeOpacity={vi.fn()}
      />
    );

    expect(screen.getByTestId("legend-opacity-value-en")).toHaveTextContent("50%");
  });

  it("calls onChangeOpacity when slider changes", () => {
    const onChangeOpacity = vi.fn();

    render(
      <OverlayLegend
        overlays={oneOverlay}
        onToggleLanguage={vi.fn()}
        onChangeOpacity={onChangeOpacity}
      />
    );

    const slider = screen.getByTestId("legend-opacity-en");
    fireEvent.change(slider, { target: { value: "0.5" } });

    expect(onChangeOpacity).toHaveBeenCalledWith("en", 0.5);
  });

  it("shows plugin group headers when overlays span multiple plugins", () => {
    render(
      <OverlayLegend
        overlays={multiPluginOverlays}
        onToggleLanguage={vi.fn()}
      />
    );

    expect(screen.getByTestId("legend-group-languages")).toBeInTheDocument();
    expect(screen.getByTestId("legend-group-climate")).toBeInTheDocument();
  });

  it("does not show group headers when all overlays are from one plugin", () => {
    render(
      <OverlayLegend overlays={twoOverlays} onToggleLanguage={vi.fn()} />
    );

    expect(screen.queryByTestId("legend-group-languages")).not.toBeInTheDocument();
  });
});
