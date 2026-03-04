"use client";

import { useEffect, useRef, useCallback } from "react";
import type { DetailField, DetailPanelConfig, SidebarConfig } from "@/lib/plugins/types";
import { getFieldValue } from "@/lib/plugin-utils";
import FieldRenderer from "./FieldRenderer";

interface GenericDetailPanelProps {
  item: Record<string, unknown>;
  allItems: Record<string, unknown>[];
  detailFields: DetailField[];
  detailPanelConfig: DetailPanelConfig;
  sidebarConfig?: SidebarConfig;
  onClose: () => void;
  onSelectItem?: (id: string) => void;
}

export default function GenericDetailPanel({
  item,
  allItems,
  detailFields,
  detailPanelConfig,
  sidebarConfig,
  onClose,
  onSelectItem,
}: GenericDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const idField = sidebarConfig?.idField ?? "code";
  const titleField = detailPanelConfig.titleField;

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

  const title = String(getFieldValue(item, titleField) ?? "");
  const subtitle = detailPanelConfig.subtitleField
    ? String(getFieldValue(item, detailPanelConfig.subtitleField) ?? "")
    : "";
  const showSubtitle = subtitle && subtitle !== title;

  return (
    <div
      ref={panelRef}
      data-testid="detail-panel"
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
              data-testid="detail-panel-title"
            >
              {title}
            </h2>
            {showSubtitle && (
              <p
                className="text-gray-300 italic text-sm"
                data-testid="detail-panel-subtitle"
              >
                {subtitle}
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

      {/* Content — generic field renderers */}
      <div className="p-4 space-y-5">
        {detailFields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            item={item}
            allItems={allItems}
            idField={idField}
            titleField={titleField}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}
