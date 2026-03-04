"use client";

import { useState } from "react";
import type { LanguageOverlay } from "./MapView";

interface OverlayLegendProps {
  overlays: LanguageOverlay[];
  onToggleLanguage: (code: string) => void;
  onChangeOpacity?: (code: string, opacity: number) => void;
}

export default function OverlayLegend({
  overlays,
  onToggleLanguage,
  onChangeOpacity,
}: OverlayLegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (overlays.length < 1) return null;

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

  // Group overlays by pluginId
  const groups = new Map<string, LanguageOverlay[]>();
  for (const overlay of overlays) {
    const pid = overlay.pluginId ?? "default";
    if (!groups.has(pid)) groups.set(pid, []);
    groups.get(pid)!.push(overlay);
  }
  const groupEntries = Array.from(groups.entries());

  return (
    <div
      className="fixed bottom-4 right-4 z-[1001] bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg min-w-[180px] max-w-[240px]"
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
        {groupEntries.map(([pluginId, pluginOverlays]) => (
          <li key={pluginId}>
            {groupEntries.length > 1 && (
              <div
                className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                data-testid={`legend-group-${pluginId}`}
              >
                {pluginId}
              </div>
            )}
            <ul>
              {pluginOverlays.map((overlay) => (
                <li key={overlay.code}>
                  <div className="w-full px-3 py-1.5 hover:bg-gray-800/50 transition-colors group">
                    <div className="flex items-center gap-2 min-h-[44px]">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: overlay.color }}
                        data-testid={`legend-swatch-${overlay.code}`}
                      />
                      <span className="text-sm text-gray-200 truncate flex-1">
                        {overlay.name ?? overlay.code}
                      </span>
                      <button
                        onClick={() => onToggleLanguage(overlay.code)}
                        className="text-gray-500 group-hover:text-gray-300 text-xs flex-shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                        data-testid={`legend-item-${overlay.code}`}
                        aria-label={`Remove ${overlay.name ?? overlay.code} overlay`}
                      >
                        ✕
                      </button>
                    </div>
                    {onChangeOpacity && (
                      <div className="flex items-center gap-2 mt-1 pb-1">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={overlay.opacity ?? 1}
                          onChange={(e) =>
                            onChangeOpacity(
                              overlay.code,
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400"
                          data-testid={`legend-opacity-${overlay.code}`}
                          aria-label={`Opacity for ${overlay.name ?? overlay.code}`}
                        />
                        <span
                          className="text-[10px] text-gray-500 w-8 text-right tabular-nums"
                          data-testid={`legend-opacity-value-${overlay.code}`}
                        >
                          {Math.round((overlay.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
