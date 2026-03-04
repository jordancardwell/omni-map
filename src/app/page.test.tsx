import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
      categories: ["linguistics", "culture"],
      dataType: "regions",
      dataSource: "static",
      category: "linguistics",
      thumbnail: "#4A90D9",
      schema: "LanguageMetadata",
    },
    {
      id: "climate",
      name: "Climate Zones",
      description: "Global climate classification regions",
      type: "regions",
      version: "1.0.0",
      icon: "layers",
      defaultColor: "#E74C3C",
      categories: ["science", "environment"],
      dataType: "regions",
      dataSource: "static",
      category: "science",
      thumbnail: "#E74C3C",
    },
    {
      id: "trade-routes",
      name: "Trade Routes",
      description: "Historical and modern trade routes",
      type: "lines",
      version: "1.0.0",
      icon: "map",
      defaultColor: "#F39C12",
      categories: ["economics", "history"],
      dataType: "lines",
      dataSource: "static",
      category: "economics",
      thumbnail: "#F39C12",
    },
  ],
}));

import LandingPage from "./page";

describe("LandingPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the landing page with title", () => {
    render(<LandingPage />);
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("landing-title")).toHaveTextContent("OmniMap");
  });

  it("renders overlay cards from plugin registry", () => {
    render(<LandingPage />);
    expect(screen.getByTestId("overlay-card-languages")).toBeInTheDocument();
    expect(screen.getByTestId("overlay-card-climate")).toBeInTheDocument();
    expect(screen.getByTestId("overlay-card-trade-routes")).toBeInTheDocument();
  });

  it("displays card name, description, and category tags", () => {
    render(<LandingPage />);
    expect(screen.getByText("World Languages")).toBeInTheDocument();
    expect(
      screen.getByTestId("card-description-languages")
    ).toHaveTextContent("Geographic regions of world languages");
    expect(
      screen.getByTestId("card-tag-languages-linguistics")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("card-tag-languages-culture")
    ).toBeInTheDocument();
  });

  it("renders thumbnail with plugin color", () => {
    render(<LandingPage />);
    const thumbnail = screen.getByTestId("card-thumbnail-languages");
    // happy-dom returns hex, browsers return rgb()
    const bg = thumbnail.style.backgroundColor;
    expect(bg === "#4A90D9" || bg === "rgb(74, 144, 217)").toBe(true);
  });

  it("groups cards by category with headers", () => {
    render(<LandingPage />);
    expect(
      screen.getByTestId("category-header-linguistics")
    ).toHaveTextContent("Linguistics");
    expect(screen.getByTestId("category-header-science")).toHaveTextContent(
      "Science"
    );
    expect(screen.getByTestId("category-header-economics")).toHaveTextContent(
      "Economics"
    );
  });

  it("renders search input", () => {
    render(<LandingPage />);
    expect(screen.getByTestId("overlay-search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search overlays...")).toBeInTheDocument();
  });

  it("renders category filter chips", () => {
    render(<LandingPage />);
    expect(screen.getByTestId("category-filters")).toBeInTheDocument();
    expect(screen.getByTestId("category-chip-linguistics")).toBeInTheDocument();
    expect(screen.getByTestId("category-chip-science")).toBeInTheDocument();
    expect(screen.getByTestId("category-chip-economics")).toBeInTheDocument();
  });

  it("uses responsive grid classes", () => {
    render(<LandingPage />);
    const grid = screen.getByTestId("category-grid-linguistics");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("sm:grid-cols-2");
    expect(grid.className).toContain("lg:grid-cols-3");
    expect(grid.className).toContain("xl:grid-cols-4");
  });

  it("uses dark theme styling", () => {
    render(<LandingPage />);
    const main = screen.getByTestId("landing-page");
    expect(main.className).toContain("bg-gray-900");
    expect(main.className).toContain("text-gray-100");
  });

  describe("search filtering", () => {
    it("filters cards by name with debounced search", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const search = screen.getByTestId("overlay-search");
      await user.type(search, "Climate");

      // Wait for debounce (300ms) to apply filter
      await waitFor(() => {
        expect(screen.queryByTestId("overlay-card-languages")).not.toBeInTheDocument();
      });
      expect(screen.getByTestId("overlay-card-climate")).toBeInTheDocument();
      expect(screen.queryByTestId("overlay-card-trade-routes")).not.toBeInTheDocument();
    });

    it("filters cards by description", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const search = screen.getByTestId("overlay-search");
      await user.type(search, "trade");

      await waitFor(() => {
        expect(screen.queryByTestId("overlay-card-languages")).not.toBeInTheDocument();
      });
      expect(screen.getByTestId("overlay-card-trade-routes")).toBeInTheDocument();
    });

    it("shows no results message when search has no matches", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const search = screen.getByTestId("overlay-search");
      await user.type(search, "xyznonexistent");

      await waitFor(() => {
        expect(screen.getByTestId("no-results")).toBeInTheDocument();
      });
      expect(screen.getByText("No overlays found")).toBeInTheDocument();
    });
  });

  describe("category filtering", () => {
    it("filters by category when chip is clicked", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      await user.click(screen.getByTestId("category-chip-linguistics"));

      expect(screen.getByTestId("overlay-card-languages")).toBeInTheDocument();
      expect(screen.queryByTestId("overlay-card-climate")).not.toBeInTheDocument();
      expect(screen.queryByTestId("overlay-card-trade-routes")).not.toBeInTheDocument();
    });

    it("toggles category filter off when chip is clicked again", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const chip = screen.getByTestId("category-chip-linguistics");

      await user.click(chip);
      expect(screen.queryByTestId("overlay-card-climate")).not.toBeInTheDocument();

      await user.click(chip);
      expect(screen.getByTestId("overlay-card-climate")).toBeInTheDocument();
    });

    it("supports multiple category selection", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      await user.click(screen.getByTestId("category-chip-linguistics"));
      await user.click(screen.getByTestId("category-chip-science"));

      expect(screen.getByTestId("overlay-card-languages")).toBeInTheDocument();
      expect(screen.getByTestId("overlay-card-climate")).toBeInTheDocument();
      expect(screen.queryByTestId("overlay-card-trade-routes")).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("navigates to map view when card is clicked", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      await user.click(screen.getByTestId("overlay-card-languages"));

      expect(mockPush).toHaveBeenCalledWith("/map?overlay=languages");
    });
  });
});
