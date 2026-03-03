"use client";

import { useState, useEffect, useMemo } from "react";
import type { LanguageMetadata } from "@/lib/plugins/language-types";
import { getFamilyColor, formatSpeakers } from "@/lib/language-utils";

interface LanguageSidebarProps {
  languages: LanguageMetadata[];
  activeLanguages: Set<string>;
  onToggleLanguage: (code: string) => void;
  onSelectLanguage?: (code: string) => void;
}

export default function LanguageSidebar({
  languages,
  activeLanguages,
  onToggleLanguage,
  onSelectLanguage,
}: LanguageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredLanguages = useMemo(() => {
    if (!debouncedQuery) return languages;
    const query = debouncedQuery.toLowerCase();
    return languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.family.toLowerCase().includes(query)
    );
  }, [languages, debouncedQuery]);

  const grouped = useMemo(() => {
    const groups: Record<string, LanguageMetadata[]> = {};
    for (const lang of filteredLanguages) {
      if (!groups[lang.family]) groups[lang.family] = [];
      groups[lang.family].push(lang);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredLanguages]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[1001] md:hidden bg-gray-800/90 backdrop-blur-sm p-2.5 rounded-lg text-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open language browser"
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
        className={`fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-sm z-[1000] flex flex-col
          transition-transform duration-300 ease-in-out
          w-full md:w-80
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        data-testid="language-sidebar"
      >
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-100">Languages</h2>
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
          <input
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            data-testid="language-search"
          />
        </div>

        <div className="flex-1 overflow-y-auto" data-testid="language-list">
          {grouped.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm" data-testid="no-results">
              No languages found
            </p>
          ) : (
            grouped.map(([family, langs]) => (
              <div key={family} data-testid={`family-group-${family}`}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-800/50 sticky top-0">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                    style={{ backgroundColor: getFamilyColor(family) }}
                  />
                  {family} ({langs.length})
                </div>
                {langs.map((lang) => {
                  const isActive = activeLanguages.has(lang.code);
                  return (
                    <div
                      key={lang.code}
                      className={`flex items-center hover:bg-gray-800/50 transition-colors ${
                        isActive ? "bg-gray-800/80" : ""
                      }`}
                      data-testid={`language-item-${lang.code}`}
                      data-active={isActive}
                    >
                      <button
                        onClick={() => onToggleLanguage(lang.code)}
                        className="flex-1 px-4 py-3 flex items-center gap-3 text-left min-w-0 min-h-[44px]"
                        data-testid={`language-toggle-${lang.code}`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex-shrink-0 transition-opacity ${
                            isActive ? "opacity-100" : "opacity-40"
                          }`}
                          style={{ backgroundColor: getFamilyColor(lang.family) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-100 truncate">
                              {lang.name}
                            </span>
                            {isActive && (
                              <span
                                className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded flex-shrink-0"
                                data-testid={`language-active-${lang.code}`}
                              >
                                ON
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="truncate">{lang.nativeName}</span>
                            <span>·</span>
                            <span className="flex-shrink-0">
                              {formatSpeakers(lang.speakers.total)} speakers
                            </span>
                          </div>
                        </div>
                      </button>
                      {onSelectLanguage && (
                        <button
                          onClick={() => onSelectLanguage(lang.code)}
                          className="px-3 py-3 text-gray-500 hover:text-gray-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`View details for ${lang.name}`}
                          data-testid={`language-info-${lang.code}`}
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
