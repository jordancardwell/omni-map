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
  color: string
): LanguageOverlay {
  return { code, data: mockGeoJson, color, name };
}

const twoOverlays: LanguageOverlay[] = [
  makeOverlay("en", "English", "#4A90D9"),
  makeOverlay("zh", "Mandarin Chinese", "#E74C3C"),
];

const threeOverlays: LanguageOverlay[] = [
  ...twoOverlays,
  makeOverlay("es", "Spanish", "#27AE60"),
];

describe("OverlayLegend", () => {
  it("does not render when fewer than 2 overlays are active", () => {
    const { container } = render(
      <OverlayLegend
        overlays={[makeOverlay("en", "English", "#4A90D9")]}
        onToggleLanguage={vi.fn()}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("does not render when no overlays are active", () => {
    const { container } = render(
      <OverlayLegend overlays={[]} onToggleLanguage={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
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
    expect(enItem).toHaveTextContent("English");

    const zhItem = screen.getByTestId("legend-item-zh");
    expect(zhItem).toHaveTextContent("Mandarin Chinese");

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

  it("calls onToggleLanguage with the correct code when legend item is clicked", () => {
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

    expect(screen.getByTestId("legend-item-en")).toHaveTextContent("en");
    expect(screen.getByTestId("legend-item-zh")).toHaveTextContent("zh");
  });
});
