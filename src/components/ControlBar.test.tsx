import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ControlBar from "./ControlBar";

const defaultProps = {
  showAllActive: false,
  hoverDetailMode: true,
  batchLoading: false,
  onToggleShowAll: vi.fn(),
  onToggleHoverDetail: vi.fn(),
};

describe("ControlBar", () => {
  it("renders both toggle buttons", () => {
    render(<ControlBar {...defaultProps} />);
    expect(screen.getByTestId("control-bar")).toBeInTheDocument();
    expect(screen.getByTestId("toggle-show-all")).toHaveTextContent("Show All");
    expect(screen.getByTestId("toggle-hover-detail")).toHaveTextContent(
      "Hover for Detail"
    );
  });

  it('shows "Hide All" when showAllActive is true', () => {
    render(<ControlBar {...defaultProps} showAllActive={true} />);
    expect(screen.getByTestId("toggle-show-all")).toHaveTextContent("Hide All");
  });

  it('shows "Click for Detail" when hoverDetailMode is false', () => {
    render(<ControlBar {...defaultProps} hoverDetailMode={false} />);
    expect(screen.getByTestId("toggle-hover-detail")).toHaveTextContent(
      "Click for Detail"
    );
  });

  it("calls onToggleShowAll when Show All is clicked", async () => {
    const onToggleShowAll = vi.fn();
    render(<ControlBar {...defaultProps} onToggleShowAll={onToggleShowAll} />);
    await userEvent.click(screen.getByTestId("toggle-show-all"));
    expect(onToggleShowAll).toHaveBeenCalledOnce();
  });

  it("calls onToggleHoverDetail when detail toggle is clicked", async () => {
    const onToggleHoverDetail = vi.fn();
    render(
      <ControlBar
        {...defaultProps}
        onToggleHoverDetail={onToggleHoverDetail}
      />
    );
    await userEvent.click(screen.getByTestId("toggle-hover-detail"));
    expect(onToggleHoverDetail).toHaveBeenCalledOnce();
  });

  it("shows loading spinner and disables button when batchLoading", () => {
    render(<ControlBar {...defaultProps} batchLoading={true} />);
    const btn = screen.getByTestId("toggle-show-all");
    expect(btn).toBeDisabled();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(btn).toHaveTextContent("Loading…");
  });
});
