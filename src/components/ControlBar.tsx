"use client";

interface ControlBarProps {
  showAllActive: boolean;
  hoverDetailMode: boolean;
  batchLoading: boolean;
  onToggleShowAll: () => void;
  onToggleHoverDetail: () => void;
}

export default function ControlBar({
  showAllActive,
  hoverDetailMode,
  batchLoading,
  onToggleShowAll,
  onToggleHoverDetail,
}: ControlBarProps) {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1001] flex items-center gap-2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg px-3 py-2"
      data-testid="control-bar"
    >
      <button
        onClick={onToggleShowAll}
        disabled={batchLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 hover:bg-gray-700 text-gray-200"
        data-testid="toggle-show-all"
      >
        {batchLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              data-testid="loading-spinner"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading…
          </>
        ) : showAllActive ? (
          "Hide All"
        ) : (
          "Show All"
        )}
      </button>
      <div className="w-px h-5 bg-gray-700" />
      <button
        onClick={onToggleHoverDetail}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px] bg-gray-800 hover:bg-gray-700 text-gray-200"
        data-testid="toggle-hover-detail"
      >
        {hoverDetailMode ? "Hover for Detail" : "Click for Detail"}
      </button>
    </div>
  );
}
