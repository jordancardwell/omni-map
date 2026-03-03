import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { LanguageMetadata } from "@/lib/plugins/language-types";
import LanguageDetailPanel from "./LanguageDetailPanel";

const mockEnglish: LanguageMetadata = {
  code: "en",
  name: "English",
  nativeName: "English",
  family: "Indo-European",
  branch: "Germanic",
  speakers: { native: 380000000, total: 1500000000, source: "Ethnologue 2024" },
  regions: ["GB", "US"],
  writingSystem: "Latin",
  dialects: ["American English", "British English"],
  endangermentStatus: "safe",
  description: "English is a West Germanic language.",
  historicalNotes: "English evolved from Anglo-Saxon.",
  relatedLanguages: ["de", "nl"],
  resources: [
    { title: "Ethnologue - English", url: "https://www.ethnologue.com/language/eng/" },
  ],
  geojson: "en.geojson",
};

const mockChinese: LanguageMetadata = {
  code: "zh",
  name: "Mandarin Chinese",
  nativeName: "普通话",
  family: "Sino-Tibetan",
  branch: "Sinitic",
  speakers: { native: 920000000, total: 1120000000, source: "Ethnologue 2024" },
  regions: ["CN"],
  writingSystem: "Chinese characters",
  dialects: ["Beijing dialect"],
  endangermentStatus: "vulnerable",
  description: "Mandarin Chinese is the most spoken language.",
  historicalNotes: "Long history.",
  relatedLanguages: ["en"],
  resources: [],
  geojson: "zh.geojson",
};

const mockGerman: LanguageMetadata = {
  code: "de",
  name: "German",
  nativeName: "Deutsch",
  family: "Indo-European",
  branch: "Germanic",
  speakers: { native: 95000000, total: 130000000, source: "test" },
  regions: ["DE"],
  writingSystem: "Latin",
  dialects: ["Bavarian"],
  endangermentStatus: "safe",
  description: "German is a language.",
  historicalNotes: "History",
  relatedLanguages: ["en"],
  resources: [],
  geojson: "de.geojson",
};

const mockDutch: LanguageMetadata = {
  code: "nl",
  name: "Dutch",
  nativeName: "Nederlands",
  family: "Indo-European",
  branch: "Germanic",
  speakers: { native: 25000000, total: 30000000, source: "test" },
  regions: ["NL"],
  writingSystem: "Latin",
  dialects: [],
  endangermentStatus: "safe",
  description: "Dutch is a language.",
  historicalNotes: "History",
  relatedLanguages: ["en"],
  resources: [],
  geojson: "nl.geojson",
};

const allLanguages = [mockEnglish, mockChinese, mockGerman, mockDutch];

describe("LanguageDetailPanel", () => {
  it("renders panel with language name", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("language-detail-panel")).toBeInTheDocument();
    expect(screen.getByTestId("detail-panel-name").textContent).toBe("English");
  });

  it("displays native name when different from name", () => {
    render(
      <LanguageDetailPanel
        language={mockChinese}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("detail-panel-native-name").textContent).toBe(
      "普通话"
    );
  });

  it("hides native name when same as name", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(
      screen.queryByTestId("detail-panel-native-name")
    ).not.toBeInTheDocument();
  });

  it("displays language family and branch", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("detail-panel-family").textContent).toBe(
      "Indo-European"
    );
    expect(screen.getByTestId("detail-panel-branch").textContent).toBe(
      "Germanic"
    );
  });

  it("displays speaker statistics with locale formatting", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(
      screen.getByTestId("detail-panel-native-speakers").textContent
    ).toBe((380000000).toLocaleString());
    expect(
      screen.getByTestId("detail-panel-total-speakers").textContent
    ).toBe((1500000000).toLocaleString());
    expect(
      screen.getByTestId("detail-panel-speakers-source").textContent
    ).toContain("Ethnologue 2024");
  });

  it("displays writing system", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(
      screen.getByTestId("detail-panel-writing-system").textContent
    ).toBe("Latin");
  });

  it("displays endangerment status with color indicator", () => {
    const { rerender } = render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    const safeIndicator = screen.getByTestId(
      "detail-panel-endangerment-indicator"
    );
    // happy-dom may return hex or rgb
    const safeColor = safeIndicator.style.backgroundColor.toLowerCase();
    expect(safeColor === "#22c55e" || safeColor === "rgb(34, 197, 94)").toBe(
      true
    );
    expect(
      screen.getByTestId("detail-panel-endangerment-status").textContent
    ).toBe("safe");

    // Rerender with vulnerable status
    rerender(
      <LanguageDetailPanel
        language={mockChinese}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    const vulnerableIndicator = screen.getByTestId(
      "detail-panel-endangerment-indicator"
    );
    const vulnColor = vulnerableIndicator.style.backgroundColor.toLowerCase();
    expect(vulnColor === "#eab308" || vulnColor === "rgb(234, 179, 8)").toBe(
      true
    );
  });

  it("displays dialects", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    const dialectsContainer = screen.getByTestId("detail-panel-dialects");
    expect(dialectsContainer.textContent).toContain("American English");
    expect(dialectsContainer.textContent).toContain("British English");
  });

  it("displays description", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("detail-panel-description").textContent).toBe(
      "English is a West Germanic language."
    );
  });

  it("displays historical notes", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    expect(
      screen.getByTestId("detail-panel-historical-notes").textContent
    ).toBe("English evolved from Anglo-Saxon.");
  });

  it("displays related languages as clickable links", () => {
    const onSelect = vi.fn();
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={onSelect}
      />
    );
    const relatedContainer = screen.getByTestId(
      "detail-panel-related-languages"
    );
    expect(relatedContainer).toBeInTheDocument();

    const germanLink = screen.getByTestId("detail-panel-related-de");
    expect(germanLink.textContent).toBe("German");

    fireEvent.click(germanLink);
    expect(onSelect).toHaveBeenCalledWith("de");
  });

  it("displays resource links", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    const resourcesContainer = screen.getByTestId("detail-panel-resources");
    expect(resourcesContainer).toBeInTheDocument();
    const link = resourcesContainer.querySelector("a");
    expect(link).toHaveAttribute(
      "href",
      "https://www.ethnologue.com/language/eng/"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={onClose}
        onSelectLanguage={() => {}}
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
        <LanguageDetailPanel
          language={mockEnglish}
          allLanguages={allLanguages}
          onClose={onClose}
          onSelectLanguage={() => {}}
        />
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId("outside-area"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={onClose}
        onSelectLanguage={() => {}}
      />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has correct z-index for layering above map and sidebar", () => {
    render(
      <LanguageDetailPanel
        language={mockEnglish}
        allLanguages={allLanguages}
        onClose={() => {}}
        onSelectLanguage={() => {}}
      />
    );
    const panel = screen.getByTestId("language-detail-panel");
    expect(panel.className).toContain("z-[1100]");
  });
});
