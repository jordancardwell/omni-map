import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GenericSidebar from "./GenericSidebar";
import type { PluginPanel } from "./GenericSidebar";
import type { SidebarConfig } from "@/lib/plugins/types";

const languagesConfig: SidebarConfig = {
  idField: "code",
  searchFields: ["name", "nativeName", "family"],
  groupBy: "family",
  titleField: "name",
  subtitleField: "nativeName",
  badgeField: "speakers.total",
  badgeFormat: "formatted-number",
};

const mockItems: Record<string, unknown>[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    family: "Indo-European",
    speakers: { total: 1500000000 },
  },
  {
    code: "zh",
    name: "Mandarin Chinese",
    nativeName: "普通话",
    family: "Sino-Tibetan",
    speakers: { total: 1120000000 },
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    family: "Indo-European",
    speakers: { total: 550000000 },
  },
];

function makePanel(overrides?: Partial<PluginPanel>): PluginPanel {
  return {
    pluginId: "languages",
    pluginName: "World Languages",
    category: "Culture & Society",
    config: languagesConfig,
    items: mockItems,
    activeItems: new Set(),
    ...overrides,
  };
}

describe("GenericSidebar", () => {
  it("renders the search input", () => {
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );
    expect(screen.getByTestId("sidebar-search")).toBeInTheDocument();
  });

  it("renders group headers from groupBy field", () => {
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );
    expect(
      screen.getByTestId("sidebar-group-Indo-European")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("sidebar-group-Sino-Tibetan")
    ).toBeInTheDocument();
  });

  it("renders items with title, subtitle, and badge", () => {
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );
    expect(screen.getByTestId("sidebar-item-en")).toBeInTheDocument();
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1.5B speakers")).toBeInTheDocument();
    expect(screen.getByText("普通话")).toBeInTheDocument();
    expect(screen.getByText("1.1B speakers")).toBeInTheDocument();
  });

  it("filters items by search query with debounce", async () => {
    vi.useFakeTimers();
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );

    const searchInput = screen.getByTestId("sidebar-search");
    fireEvent.change(searchInput, { target: { value: "chin" } });

    // Before debounce
    expect(screen.getByTestId("sidebar-item-en")).toBeInTheDocument();

    // After debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId("sidebar-item-en")).not.toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-zh")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("filters by group field (family)", async () => {
    vi.useFakeTimers();
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId("sidebar-search"), {
      target: { value: "Sino-Tibetan" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("sidebar-item-zh")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-item-en")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows active state for toggled items", () => {
    render(
      <GenericSidebar
        panels={[makePanel({ activeItems: new Set(["en"]) })]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );
    expect(screen.getByTestId("sidebar-active-en")).toBeInTheDocument();
    expect(
      screen.queryByTestId("sidebar-active-zh")
    ).not.toBeInTheDocument();
  });

  it("calls onToggleItem when item is clicked", () => {
    const onToggle = vi.fn();
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={onToggle}
      />
    );
    fireEvent.click(screen.getByTestId("sidebar-toggle-en"));
    expect(onToggle).toHaveBeenCalledWith("languages", "en");
  });

  it("calls onSelectItem when info button is clicked", () => {
    const onSelect = vi.fn();
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
        onSelectItem={onSelect}
      />
    );
    fireEvent.click(screen.getByTestId("sidebar-info-en"));
    expect(onSelect).toHaveBeenCalledWith("languages", "en");
  });

  it("shows no results message when search matches nothing", () => {
    vi.useFakeTimers();
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId("sidebar-search"), {
      target: { value: "zzzzzzz" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("no-results")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows tabs when multiple panels are provided", () => {
    const geologyPanel: PluginPanel = {
      pluginId: "geology",
      pluginName: "Geology",
      category: "Geology & Earth Science",
      config: {
        idField: "id",
        searchFields: ["name"],
        titleField: "name",
      },
      items: [{ id: "basalt", name: "Basalt" }],
      activeItems: new Set(),
    };

    render(
      <GenericSidebar
        panels={[makePanel(), geologyPanel]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );

    expect(screen.getByTestId("sidebar-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("plugin-dropdown-trigger")).toBeInTheDocument();
    // Tabs are inside dropdown — open it to check
    fireEvent.click(screen.getByTestId("plugin-dropdown-trigger"));
    expect(screen.getByTestId("sidebar-tab-languages")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-tab-geology")).toBeInTheDocument();
  });

  it("switches panels when a tab is clicked", () => {
    const onChange = vi.fn();
    const geologyPanel: PluginPanel = {
      pluginId: "geology",
      pluginName: "Geology",
      category: "Geology & Earth Science",
      config: {
        idField: "id",
        searchFields: ["name"],
        titleField: "name",
      },
      items: [{ id: "basalt", name: "Basalt" }],
      activeItems: new Set(),
    };

    render(
      <GenericSidebar
        panels={[makePanel(), geologyPanel]}
        activePluginId="languages"
        onChangeActivePlugin={onChange}
        onToggleItem={() => {}}
      />
    );

    // Open dropdown first, then click the tab
    fireEvent.click(screen.getByTestId("plugin-dropdown-trigger"));
    fireEvent.click(screen.getByTestId("sidebar-tab-geology"));
    expect(onChange).toHaveBeenCalledWith("geology");
  });

  it("does not show tabs when only one panel", () => {
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );
    expect(screen.queryByTestId("sidebar-tabs")).not.toBeInTheDocument();
  });

  it("displays plugin name as heading", () => {
    render(
      <GenericSidebar
        panels={[makePanel()]}
        activePluginId="languages"
        onChangeActivePlugin={() => {}}
        onToggleItem={() => {}}
      />
    );
    expect(screen.getByText("World Languages")).toBeInTheDocument();
  });
});
