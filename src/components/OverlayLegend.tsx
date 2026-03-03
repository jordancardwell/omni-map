"use client";

import { useState } from "react";
import type { LanguageOverlay } from "./MapView";

interface OverlayLegendProps {
  overlays: LanguageOverlay[];
  onToggleLanguage: (code: string) => void;
}

export default function OverlayLegend({
  overlays,
  onToggleLanguage,
}: OverlayLegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (overlays.length < 2) return null;

  if (collapsed) {
    return (
      <div
        className="fixed bottom-4 right-4 z-[1001] md:hidden"
        data-testid="overlay-legend"
      >
        <button
          onClick={() => setCollapsed(false)}
          className="bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-2 text-gray-100 text-xs font-medium border border-gray-700 shadow-lg min-h-[44px] flex items-center"
          data-testid="legend-expand"
        >
          Legend ({overlays.length})
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[1001] bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg min-w-[140px] max-w-[200px]"
      data-testid="overlay-legend"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Active Overlays
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="md:hidden text-gray-500 hover:text-gray-300 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Collapse legend"
          data-testid="legend-collapse"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      <ul className="py-1" data-testid="legend-list">
        {overlays.map((overlay) => (
          <li key={overlay.code}>
            <button
              onClick={() => onToggleLanguage(overlay.code)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-800/50 transition-colors group min-h-[44px]"
              data-testid={`legend-item-${overlay.code}`}
              aria-label={`Remove ${overlay.name ?? overlay.code} overlay`}
            >
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: overlay.color }}
                data-testid={`legend-swatch-${overlay.code}`}
              />
              <span className="text-sm text-gray-200 truncate flex-1">
                {overlay.name ?? overlay.code}
              </span>
              <span className="text-gray-500 group-hover:text-gray-300 text-xs flex-shrink-0">
                ✕
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
