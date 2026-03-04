import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FieldRenderer from "./FieldRenderer";
import type { DetailField } from "@/lib/plugins/types";

describe("FieldRenderer", () => {
  it("renders text field", () => {
    const field: DetailField = { key: "family", label: "Family", type: "text" };
    render(<FieldRenderer field={field} item={{ family: "Indo-European" }} />);
    expect(screen.getByTestId("field-family")).toBeInTheDocument();
    expect(screen.getByText("Indo-European")).toBeInTheDocument();
    expect(screen.getByText("Family")).toBeInTheDocument();
  });

  it("renders number field", () => {
    const field: DetailField = { key: "count", label: "Count", type: "number" };
    render(<FieldRenderer field={field} item={{ count: 42 }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders formatted-number field with locale formatting", () => {
    const field: DetailField = {
      key: "speakers.total",
      label: "Total Speakers",
      type: "formatted-number",
    };
    render(
      <FieldRenderer
        field={field}
        item={{ speakers: { total: 1500000000 } }}
      />
    );
    expect(screen.getByText((1500000000).toLocaleString())).toBeInTheDocument();
  });

  it("renders list field as bullet list", () => {
    const field: DetailField = { key: "regions", label: "Regions", type: "list" };
    render(<FieldRenderer field={field} item={{ regions: ["GB", "US", "AU"] }} />);
    expect(screen.getByText("GB")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("AU")).toBeInTheDocument();
  });

  it("renders tags field as chips", () => {
    const field: DetailField = { key: "dialects", label: "Dialects", type: "tags" };
    render(
      <FieldRenderer
        field={field}
        item={{ dialects: ["American English", "British English"] }}
      />
    );
    expect(screen.getByText("American English")).toBeInTheDocument();
    expect(screen.getByText("British English")).toBeInTheDocument();
  });

  it("renders tags with referenceItems as clickable buttons", () => {
    const onSelect = vi.fn();
    const field: DetailField = {
      key: "relatedLanguages",
      label: "Related",
      type: "tags",
      referenceItems: true,
    };
    const allItems = [
      { code: "de", name: "German" },
      { code: "nl", name: "Dutch" },
    ];
    render(
      <FieldRenderer
        field={field}
        item={{ relatedLanguages: ["de", "nl"] }}
        allItems={allItems}
        idField="code"
        titleField="name"
        onSelectItem={onSelect}
      />
    );
    const germanBtn = screen.getByTestId("field-ref-de");
    expect(germanBtn.textContent).toBe("German");
    fireEvent.click(germanBtn);
    expect(onSelect).toHaveBeenCalledWith("de");
  });

  it("renders links field with external links", () => {
    const field: DetailField = { key: "resources", label: "Resources", type: "links" };
    render(
      <FieldRenderer
        field={field}
        item={{
          resources: [
            { title: "Ethnologue", url: "https://ethnologue.com" },
          ],
        }}
      />
    );
    const link = screen.getByText(/Ethnologue/);
    expect(link.closest("a")).toHaveAttribute("href", "https://ethnologue.com");
    expect(link.closest("a")).toHaveAttribute("target", "_blank");
  });

  it("renders status-badge field with color indicator", () => {
    const field: DetailField = {
      key: "endangermentStatus",
      label: "Status",
      type: "status-badge",
      statusColors: { safe: "#22c55e", vulnerable: "#eab308" },
    };
    render(
      <FieldRenderer field={field} item={{ endangermentStatus: "safe" }} />
    );
    const indicator = screen.getByTestId(
      "field-status-indicator-endangermentStatus"
    );
    const color = indicator.style.backgroundColor.toLowerCase();
    expect(color === "#22c55e" || color === "rgb(34, 197, 94)").toBe(true);
    expect(screen.getByText("safe")).toBeInTheDocument();
  });

  it("renders markdown field as text", () => {
    const field: DetailField = {
      key: "description",
      label: "Description",
      type: "markdown",
    };
    render(
      <FieldRenderer
        field={field}
        item={{ description: "A West Germanic language." }}
      />
    );
    expect(
      screen.getByText("A West Germanic language.")
    ).toBeInTheDocument();
  });

  it("returns null for null/undefined values", () => {
    const field: DetailField = { key: "missing", label: "Missing", type: "text" };
    const { container } = render(
      <FieldRenderer field={field} item={{}} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null for empty string values", () => {
    const field: DetailField = { key: "empty", label: "Empty", type: "text" };
    const { container } = render(
      <FieldRenderer field={field} item={{ empty: "" }} />
    );
    expect(container.innerHTML).toBe("");
  });
});
