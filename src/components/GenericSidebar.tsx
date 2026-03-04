"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { SidebarConfig } from "@/lib/plugins/types";
import { getFieldValue, formatCompactNumber, buildGroupColorMap } from "@/lib/plugin-utils";
import { getPluginPalette } from "@/lib/language-utils";

export interface PluginPanel {
  pluginId: string;
  pluginName: string;
  category: string;
  config: SidebarConfig;
  items: Record<string, unknown>[];
  activeItems: Set<string>;
}

interface GenericSidebarProps {
  panels: PluginPanel[];
  activePluginId: string;
  onChangeActivePlugin: (pluginId: string) => void;
  onToggleItem: (pluginId: string, itemId: string) => void;
  onSelectItem?: (pluginId: string, itemId: string) => void;
  onHoverItem?: (pluginId: string, itemId: string) => void;
  onHoverItemEnd?: () => void;
}

export default function GenericSidebar({
  panels,
  activePluginId,
  onChangeActivePlugin,
  onToggleItem,
  onSelectItem,
  onHoverItem,
  onHoverItemEnd,
}: GenericSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePanel = panels.find((p) => p.pluginId === activePluginId) ?? panels[0];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTabClick = (pluginId: string) => {
    setSearchQuery("");
    setDebouncedQuery("");
    setDropdownOpen(false);
    onChangeActivePlugin(pluginId);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Group panels by category for dropdown
  const panelsByCategory = useMemo(() => {
    const groups: Record<string, PluginPanel[]> = {};
    for (const panel of panels) {
      const cat = panel.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(panel);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [panels]);

  const config = activePanel?.config;

  const filteredItems = useMemo(() => {
    if (!activePanel || !config) return [];
    if (!debouncedQuery) return activePanel.items;
    const query = debouncedQuery.toLowerCase();
    return activePanel.items.filter((item) =>
      config.searchFields.some((field) => {
        const val = getFieldValue(item, field);
        return val != null && String(val).toLowerCase().includes(query);
      })
    );
  }, [activePanel, config, debouncedQuery]);

  const grouped = useMemo(() => {
    if (!config?.groupBy) {
      return [["", filteredItems]] as [string, Record<string, unknown>[]][];
    }
    const groups: Record<string, Record<string, unknown>[]> = {};
    for (const item of filteredItems) {
      const groupKey = String(getFieldValue(item, config.groupBy) ?? "Other");
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredItems, config]);

  const groupColorMap = useMemo(() => {
    if (!activePanel || !config?.groupBy) return {};
    const groupNames = [
      ...new Set(
        activePanel.items.map((item) =>
          String(getFieldValue(item, config.groupBy!) ?? "Other")
        )
      ),
    ];
    const palette = getPluginPalette(activePanel.pluginId);
    return buildGroupColorMap(groupNames, palette);
  }, [activePanel, config]);

  if (!activePanel || !config) return null;

  const showTabs = panels.length > 1;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-4 left-4 z-[1001] md:hidden bg-gray-800/90 backdrop-blur-sm p-2.5 rounded-lg text-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open sidebar"
          data-testid="sidebar-toggle"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      <aside
        className={`absolute top-0 left-0 h-full bg-gray-900/95 backdrop-blur-sm z-[1000] flex flex-col
          transition-transform duration-300 ease-in-out
          w-full md:w-80
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        data-testid="generic-sidebar"
      >
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-100">
              {activePanel.pluginName}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close sidebar"
              data-testid="sidebar-close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {showTabs && (
            <div ref={dropdownRef} className="relative mb-3" data-testid="sidebar-tabs">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-100 hover:border-gray-500 transition-colors"
                data-testid="plugin-dropdown-trigger"
              >
                <span className="truncate">{activePanel.pluginName}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`flex-shrink-0 ml-2 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-72 overflow-y-auto z-10">
                  {panelsByCategory.map(([category, categoryPanels]) => (
                    <div key={category}>
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        {category}
                      </div>
                      {categoryPanels.map((panel) => (
                        <button
                          key={panel.pluginId}
                          onClick={() => handleTabClick(panel.pluginId)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            panel.pluginId === activePluginId
                              ? "bg-gray-700 text-gray-100"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-gray-100"
                          }`}
                          data-testid={`sidebar-tab-${panel.pluginId}`}
                        >
                          {panel.pluginName}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder={`Search ${activePanel.pluginName.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            data-testid="sidebar-search"
          />
        </div>

        <div className="flex-1 overflow-y-auto" data-testid="sidebar-list">
          {grouped.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm" data-testid="no-results">
              No items found
            </p>
          ) : (
            grouped.map(([groupName, items]) => (
              <div key={groupName} data-testid={`sidebar-group-${groupName}`}>
                {groupName && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-800/50 sticky top-0">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                      style={{
                        backgroundColor:
                          groupColorMap[groupName] ?? "#888888",
                      }}
                    />
                    {groupName} ({items.length})
                  </div>
                )}
                {items.map((item) => {
                  const itemId = String(getFieldValue(item, config.idField));
                  const isActive = activePanel.activeItems.has(itemId);
                  const title = String(
                    getFieldValue(item, config.titleField) ?? itemId
                  );
                  const subtitle = config.subtitleField
                    ? String(
                        getFieldValue(item, config.subtitleField) ?? ""
                      )
                    : "";
                  const badge = config.badgeField
                    ? getFieldValue(item, config.badgeField)
                    : null;
                  const groupKey = config.groupBy
                    ? String(
                        getFieldValue(item, config.groupBy) ?? "Other"
                      )
                    : "";
                  const itemColor = groupColorMap[groupKey] ?? "#888888";

                  let badgeText = "";
                  if (badge != null) {
                    if (
                      config.badgeFormat === "formatted-number" &&
                      typeof badge === "number"
                    ) {
                      badgeText = `${formatCompactNumber(badge)} speakers`;
                    } else {
                      badgeText = String(badge);
                    }
                  }

                  return (
                    <div
                      key={itemId}
                      className={`flex items-center hover:bg-gray-800/50 transition-colors ${
                        isActive ? "bg-gray-800/80" : ""
                      }`}
                      data-testid={`sidebar-item-${itemId}`}
                      data-active={isActive}
                      onMouseEnter={() => {
                        if (!isActive && onHoverItem) onHoverItem(activePanel.pluginId, itemId);
                      }}
                      onMouseLeave={() => {
                        if (onHoverItemEnd) onHoverItemEnd();
                      }}
                    >
                      <button
                        onClick={() =>
                          onToggleItem(activePanel.pluginId, itemId)
                        }
                        className="flex-1 px-4 py-3 flex items-center gap-3 text-left min-w-0 min-h-[44px]"
                        data-testid={`sidebar-toggle-${itemId}`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex-shrink-0 transition-opacity ${
                            isActive ? "opacity-100" : "opacity-40"
                          }`}
                          style={{ backgroundColor: itemColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-100 truncate">
                              {title}
                            </span>
                            {isActive && (
                              <span
                                className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded flex-shrink-0"
                                data-testid={`sidebar-active-${itemId}`}
                              >
                                ON
                              </span>
                            )}
                          </div>
                          {(subtitle || badgeText) && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {subtitle && (
                                <span className="truncate">{subtitle}</span>
                              )}
                              {subtitle && badgeText && <span>·</span>}
                              {badgeText && (
                                <span className="flex-shrink-0">
                                  {badgeText}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                      {onSelectItem && (
                        <button
                          onClick={() =>
                            onSelectItem(activePanel.pluginId, itemId)
                          }
                          className="px-3 py-3 text-gray-500 hover:text-gray-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`View details for ${title}`}
                          data-testid={`sidebar-info-${itemId}`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
