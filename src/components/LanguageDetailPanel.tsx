"use client";

import { useEffect, useRef, useCallback } from "react";
import type { LanguageMetadata } from "@/lib/plugins/language-types";
import { getFamilyColor } from "@/lib/language-utils";

interface LanguageDetailPanelProps {
  language: LanguageMetadata;
  allLanguages: LanguageMetadata[];
  onClose: () => void;
  onSelectLanguage: (code: string) => void;
}

const ENDANGERMENT_COLORS: Record<string, string> = {
  safe: "#22c55e",
  vulnerable: "#eab308",
  endangered: "#f97316",
  "critically endangered": "#ef4444",
};

function getEndangermentColor(status: string): string {
  return ENDANGERMENT_COLORS[status.toLowerCase()] ?? "#9ca3af";
}

export default function LanguageDetailPanel({
  language,
  allLanguages,
  onClose,
  onSelectLanguage,
}: LanguageDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const resolveLanguageName = (code: string): string | null => {
    const lang = allLanguages.find((l) => l.code === code);
    return lang ? lang.name : null;
  };

  return (
    <div
      ref={panelRef}
      data-testid="language-detail-panel"
      className={`
        fixed z-[1100] bg-gray-900/95 backdrop-blur-sm text-gray-100 overflow-y-auto
        border-gray-700 shadow-2xl
        inset-0 md:inset-auto
        md:top-0 md:right-0 md:h-full md:w-96 md:border-l
      `}
    >
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-200 mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back"
            data-testid="detail-panel-back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold truncate"
              data-testid="detail-panel-name"
            >
              {language.name}
            </h2>
            {language.nativeName !== language.name && (
              <p
                className="text-gray-300 italic text-sm"
                data-testid="detail-panel-native-name"
              >
                {language.nativeName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="hidden md:flex text-gray-400 hover:text-gray-200 ml-3 flex-shrink-0 min-w-[44px] min-h-[44px] items-center justify-center"
            aria-label="Close detail panel"
            data-testid="detail-panel-close"
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
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Language Family & Branch */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getFamilyColor(language.family) }}
            />
            <span
              className="text-sm font-medium"
              data-testid="detail-panel-family"
            >
              {language.family}
            </span>
            <span className="text-gray-500">·</span>
            <span
              className="text-sm text-gray-400"
              data-testid="detail-panel-branch"
            >
              {language.branch}
            </span>
          </div>
        </section>

        {/* Speaker Statistics */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Speakers
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div
                className="text-lg font-bold"
                data-testid="detail-panel-native-speakers"
              >
                {language.speakers.native.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Native</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div
                className="text-lg font-bold"
                data-testid="detail-panel-total-speakers"
              >
                {language.speakers.total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>
          <p
            className="text-xs text-gray-500 mt-1"
            data-testid="detail-panel-speakers-source"
          >
            Source: {language.speakers.source}
          </p>
        </section>

        {/* Writing System */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Writing System
          </h3>
          <p className="text-sm" data-testid="detail-panel-writing-system">
            {language.writingSystem}
          </p>
        </section>

        {/* Endangerment Status */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Endangerment Status
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: getEndangermentColor(
                  language.endangermentStatus
                ),
              }}
              data-testid="detail-panel-endangerment-indicator"
            />
            <span
              className="text-sm capitalize"
              data-testid="detail-panel-endangerment-status"
            >
              {language.endangermentStatus}
            </span>
          </div>
        </section>

        {/* Dialects */}
        {language.dialects.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Dialects
            </h3>
            <div
              className="flex flex-wrap gap-1.5"
              data-testid="detail-panel-dialects"
            >
              {language.dialects.map((dialect) => (
                <span
                  key={dialect}
                  className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300"
                >
                  {dialect}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Description
          </h3>
          <p
            className="text-sm text-gray-300 leading-relaxed"
            data-testid="detail-panel-description"
          >
            {language.description}
          </p>
        </section>

        {/* Historical Notes */}
        {language.historicalNotes && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Historical Notes
            </h3>
            <p
              className="text-sm text-gray-300 leading-relaxed"
              data-testid="detail-panel-historical-notes"
            >
              {language.historicalNotes}
            </p>
          </section>
        )}

        {/* Related Languages */}
        {language.relatedLanguages.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Related Languages
            </h3>
            <div
              className="flex flex-wrap gap-1.5"
              data-testid="detail-panel-related-languages"
            >
              {language.relatedLanguages.map((code) => {
                const name = resolveLanguageName(code);
                if (!name) return null;
                return (
                  <button
                    key={code}
                    onClick={() => onSelectLanguage(code)}
                    className="text-xs px-3 py-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors min-h-[44px] flex items-center"
                    data-testid={`detail-panel-related-${code}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Resources */}
        {language.resources.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Resources
            </h3>
            <div
              className="space-y-1.5"
              data-testid="detail-panel-resources"
            >
              {language.resources.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors min-h-[44px] flex items-center"
                >
                  {resource.title} ↗
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
