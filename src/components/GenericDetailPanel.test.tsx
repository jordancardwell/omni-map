import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GenericDetailPanel from "./GenericDetailPanel";
import type { DetailField, DetailPanelConfig, SidebarConfig } from "@/lib/plugins/types";

const detailPanelConfig: DetailPanelConfig = {
  titleField: "name",
  subtitleField: "nativeName",
};

const sidebarConfig: SidebarConfig = {
  idField: "code",
  searchFields: ["name"],
  titleField: "name",
};

const detailFields: DetailField[] = [
  { key: "family", label: "Language Family", type: "text" },
  { key: "branch", label: "Branch", type: "text" },
  { key: "speakers.native", label: "Native Speakers", type: "formatted-number" },
  { key: "speakers.total", label: "Total Speakers", type: "formatted-number" },
  { key: "speakers.source", label: "Source", type: "text" },
  { key: "writingSystem", label: "Writing System", type: "text" },
  {
    key: "endangermentStatus",
    label: "Endangerment Status",
    type: "status-badge",
    statusColors: {
      safe: "#22c55e",
      vulnerable: "#eab308",
      endangered: "#f97316",
      "critically endangered": "#ef4444",
    },
  },
  { key: "dialects", label: "Dialects", type: "tags" },
  { key: "description", label: "Description", type: "markdown" },
  { key: "historicalNotes", label: "Historical Notes", type: "markdown" },
  { key: "relatedLanguages", label: "Related Languages", type: "tags", referenceItems: true },
  { key: "resources", label: "Resources", type: "links" },
];

const mockEnglish: Record<string, unknown> = {
  code: "en",
  name: "English",
  nativeName: "English",
  family: "Indo-European",
  branch: "Germanic",
  speakers: { native: 380000000, total: 1500000000, source: "Ethnologue 2024" },
  writingSystem: "Latin",
  dialects: ["American English", "British English"],
  endangermentStatus: "safe",
  description: "English is a West Germanic language.",
  historicalNotes: "English evolved from Anglo-Saxon.",
  relatedLanguages: ["de", "nl"],
  resources: [
    { title: "Ethnologue - English", url: "https://www.ethnologue.com/language/eng/" },
  ],
};

const mockChinese: Record<string, unknown> = {
  code: "zh",
  name: "Mandarin Chinese",
  nativeName: "普通话",
  family: "Sino-Tibetan",
  branch: "Sinitic",
  speakers: { native: 920000000, total: 1120000000, source: "Ethnologue 2024" },
  writingSystem: "Chinese characters",
  dialects: ["Beijing dialect"],
  endangermentStatus: "vulnerable",
  description: "Mandarin Chinese is the most spoken language.",
  historicalNotes: "Long history.",
  relatedLanguages: ["en"],
  resources: [],
};

const mockGerman: Record<string, unknown> = {
  code: "de",
  name: "German",
  nativeName: "Deutsch",
  family: "Indo-European",
  branch: "Germanic",
  speakers: { native: 95000000, total: 130000000, source: "test" },
  writingSystem: "Latin",
  dialects: ["Bavarian"],
  endangermentStatus: "safe",
  description: "German is a language.",
  historicalNotes: "History",
  relatedLanguages: ["en"],
  resources: [],
};

const mockDutch: Record<string, unknown> = {
  code: "nl",
  name: "Dutch",
  nativeName: "Nederlands",
  family: "Indo-European",
  branch: "Germanic",
  speakers: { native: 25000000, total: 30000000, source: "test" },
  writingSystem: "Latin",
  dialects: [],
  endangermentStatus: "safe",
  description: "Dutch is a language.",
  historicalNotes: "History",
  relatedLanguages: ["en"],
  resources: [],
};

const allItems = [mockEnglish, mockChinese, mockGerman, mockDutch];

describe("GenericDetailPanel", () => {
  it("renders panel with title from config", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("detail-panel")).toBeInTheDocument();
    expect(screen.getByTestId("detail-panel-title").textContent).toBe("English");
  });

  it("displays subtitle when different from title", () => {
    render(
      <GenericDetailPanel
        item={mockChinese}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("detail-panel-subtitle").textContent).toBe("普通话");
  });

  it("hides subtitle when same as title", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.queryByTestId("detail-panel-subtitle")).not.toBeInTheDocument();
  });

  it("renders language family and branch fields", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("field-family")).toBeInTheDocument();
    expect(screen.getByText("Indo-European")).toBeInTheDocument();
    expect(screen.getByTestId("field-branch")).toBeInTheDocument();
    expect(screen.getByText("Germanic")).toBeInTheDocument();
  });

  it("renders speaker statistics with locale formatting", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.getByText((380000000).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText((1500000000).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue 2024/)).toBeInTheDocument();
  });

  it("renders writing system", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.getByText("Latin")).toBeInTheDocument();
  });

  it("renders endangerment status with color indicator", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    const indicator = screen.getByTestId(
      "field-status-indicator-endangermentStatus"
    );
    const color = indicator.style.backgroundColor.toLowerCase();
    expect(color === "#22c55e" || color === "rgb(34, 197, 94)").toBe(true);
    expect(screen.getByText("safe")).toBeInTheDocument();
  });

  it("renders dialects as tags", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(screen.getByText("American English")).toBeInTheDocument();
    expect(screen.getByText("British English")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(
      screen.getByText("English is a West Germanic language.")
    ).toBeInTheDocument();
  });

  it("renders historical notes", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    expect(
      screen.getByText("English evolved from Anglo-Saxon.")
    ).toBeInTheDocument();
  });

  it("renders related languages as clickable reference tags", () => {
    const onSelect = vi.fn();
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
        onSelectItem={onSelect}
      />
    );
    const germanBtn = screen.getByTestId("field-ref-de");
    expect(germanBtn.textContent).toBe("German");
    fireEvent.click(germanBtn);
    expect(onSelect).toHaveBeenCalledWith("de");
  });

  it("renders resource links", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    const link = screen.getByText(/Ethnologue - English/);
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://www.ethnologue.com/language/eng/"
    );
    expect(link.closest("a")).toHaveAttribute("target", "_blank");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByTestId("detail-panel-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking outside the panel", () => {
    const onClose = vi.fn();
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <GenericDetailPanel
          item={mockEnglish}
          allItems={allItems}
          detailFields={detailFields}
          detailPanelConfig={detailPanelConfig}
          sidebarConfig={sidebarConfig}
          onClose={onClose}
        />
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId("outside-area"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={onClose}
      />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has correct z-index for layering above map and sidebar", () => {
    render(
      <GenericDetailPanel
        item={mockEnglish}
        allItems={allItems}
        detailFields={detailFields}
        detailPanelConfig={detailPanelConfig}
        sidebarConfig={sidebarConfig}
        onClose={() => {}}
      />
    );
    const panel = screen.getByTestId("detail-panel");
    expect(panel.className).toContain("z-[1100]");
  });
});
