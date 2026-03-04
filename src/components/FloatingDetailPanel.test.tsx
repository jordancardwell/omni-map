import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FloatingDetailPanel from "./FloatingDetailPanel";
import type { HoverDetail } from "./FloatingDetailPanel";
import type { DetailField } from "@/lib/plugins/types";

const mockDetail: HoverDetail = {
  pluginId: "languages",
  item: {
    code: "en",
    name: "English",
    nativeName: "English",
    family: "Indo-European",
    speakers: { total: 1500000000 },
    status: "living",
    regions: ["Europe", "Americas"],
  },
  x: 200,
  y: 300,
};

const mockFields: DetailField[] = [
  { key: "family", label: "Family", type: "text" },
  { key: "speakers.total", label: "Total Speakers", type: "formatted-number" },
  { key: "status", label: "Status", type: "text" },
  { key: "regions", label: "Regions", type: "tags" },
  { key: "extraField", label: "Extra", type: "text" },
];

describe("FloatingDetailPanel", () => {
  it("renders title and subtitle", () => {
    render(
      <FloatingDetailPanel
        detail={mockDetail}
        titleField="name"
        subtitleField="nativeName"
        detailFields={[]}
        allItems={[]}
      />
    );
    expect(screen.getByTestId("floating-detail-panel")).toBeInTheDocument();
    expect(screen.getByTestId("floating-detail-title")).toHaveTextContent(
      "English"
    );
    // subtitle same as title → hidden
    expect(
      screen.queryByTestId("floating-detail-subtitle")
    ).not.toBeInTheDocument();
  });

  it("renders subtitle when different from title", () => {
    const detail = {
      ...mockDetail,
      item: { ...mockDetail.item, nativeName: "Anglais" },
    };
    render(
      <FloatingDetailPanel
        detail={detail}
        titleField="name"
        subtitleField="nativeName"
        detailFields={[]}
        allItems={[]}
      />
    );
    expect(screen.getByTestId("floating-detail-subtitle")).toHaveTextContent(
      "Anglais"
    );
  });

  it("renders up to 4 detail fields", () => {
    render(
      <FloatingDetailPanel
        detail={mockDetail}
        titleField="name"
        detailFields={mockFields}
        allItems={[mockDetail.item]}
      />
    );
    // Should show first 4 fields, not the 5th
    expect(screen.getByTestId("field-family")).toBeInTheDocument();
    expect(screen.getByTestId("field-speakers.total")).toBeInTheDocument();
    expect(screen.getByTestId("field-status")).toBeInTheDocument();
    expect(screen.getByTestId("field-regions")).toBeInTheDocument();
    expect(screen.queryByTestId("field-extraField")).not.toBeInTheDocument();
  });

  it("positions at cursor offset", () => {
    render(
      <FloatingDetailPanel
        detail={mockDetail}
        titleField="name"
        detailFields={[]}
        allItems={[]}
      />
    );
    const panel = screen.getByTestId("floating-detail-panel");
    expect(panel.style.left).toBe("216px"); // 200 + 16
    expect(panel.style.top).toBe("316px"); // 300 + 16
    expect(panel.style.pointerEvents).toBe("none");
  });
});
