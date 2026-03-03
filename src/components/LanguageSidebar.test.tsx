import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { LanguageMetadata } from "@/lib/plugins/language-types";
import LanguageSidebar from "./LanguageSidebar";

const mockLanguages: LanguageMetadata[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    family: "Indo-European",
    branch: "Germanic",
    speakers: { native: 380000000, total: 1500000000, source: "test" },
    regions: ["GB", "US"],
    writingSystem: "Latin",
    dialects: ["American English"],
    endangermentStatus: "safe",
    description: "English language",
    historicalNotes: "History",
    relatedLanguages: ["de"],
    resources: [],
    geojson: "en.geojson",
  },
  {
    code: "zh",
    name: "Mandarin Chinese",
    nativeName: "普通话",
    family: "Sino-Tibetan",
    branch: "Sinitic",
    speakers: { native: 920000000, total: 1120000000, source: "test" },
    regions: ["CN"],
    writingSystem: "Chinese characters",
    dialects: ["Beijing dialect"],
    endangermentStatus: "safe",
    description: "Mandarin",
    historicalNotes: "History",
    relatedLanguages: ["yue"],
    resources: [],
    geojson: "zh.geojson",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    family: "Indo-European",
    branch: "Romance",
    speakers: { native: 475000000, total: 550000000, source: "test" },
    regions: ["ES", "MX"],
    writingSystem: "Latin",
    dialects: ["Castilian"],
    endangermentStatus: "safe",
    description: "Spanish language",
    historicalNotes: "History",
    relatedLanguages: ["pt"],
    resources: [],
    geojson: "es.geojson",
  },
];

describe("LanguageSidebar", () => {
  it("renders the search input", () => {
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("language-search")).toBeInTheDocument();
  });

  it("renders language family categories", () => {
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={() => {}}
      />
    );
    expect(
      screen.getByTestId("family-group-Indo-European")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("family-group-Sino-Tibetan")
    ).toBeInTheDocument();
  });

  it("renders language items with name, native name, and speaker count", () => {
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("language-item-en")).toBeInTheDocument();
    // "English" appears as both name and nativeName, so use getAllByText
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1.5B speakers")).toBeInTheDocument();
    expect(screen.getByText("普通话")).toBeInTheDocument();
    expect(screen.getByText("1.1B speakers")).toBeInTheDocument();
  });

  it("filters languages by search query with debounce", async () => {
    vi.useFakeTimers();
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={() => {}}
      />
    );

    const searchInput = screen.getByTestId("language-search");
    fireEvent.change(searchInput, { target: { value: "chin" } });

    // Before debounce, all languages still visible
    expect(screen.getByTestId("language-item-en")).toBeInTheDocument();

    // After debounce, only Mandarin Chinese matches
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId("language-item-en")).not.toBeInTheDocument();
    expect(screen.getByTestId("language-item-zh")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("filters by language family name", async () => {
    vi.useFakeTimers();
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId("language-search"), {
      target: { value: "Sino-Tibetan" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("language-item-zh")).toBeInTheDocument();
    expect(screen.queryByTestId("language-item-en")).not.toBeInTheDocument();
    expect(screen.queryByTestId("language-item-es")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows active state for toggled languages", () => {
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set(["en"])}
        onToggleLanguage={() => {}}
      />
    );
    expect(screen.getByTestId("language-active-en")).toBeInTheDocument();
    expect(screen.queryByTestId("language-active-zh")).not.toBeInTheDocument();
  });

  it("calls onToggleLanguage when a language item is clicked", () => {
    const onToggle = vi.fn();
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={onToggle}
      />
    );
    fireEvent.click(screen.getByTestId("language-toggle-en"));
    expect(onToggle).toHaveBeenCalledWith("en");
  });

  it("shows no results message when search matches nothing", () => {
    vi.useFakeTimers();
    render(
      <LanguageSidebar
        languages={mockLanguages}
        activeLanguages={new Set()}
        onToggleLanguage={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId("language-search"), {
      target: { value: "zzzzzzz" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("no-results")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
