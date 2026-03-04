"use client";

import type { DetailField } from "@/lib/plugins/types";
import FieldRenderer from "./FieldRenderer";

export interface HoverDetail {
  pluginId: string;
  item: Record<string, unknown>;
  x: number;
  y: number;
}

interface FloatingDetailPanelProps {
  detail: HoverDetail;
  titleField: string;
  subtitleField?: string;
  detailFields: DetailField[];
  allItems: Record<string, unknown>[];
  idField?: string;
}

const MAX_FIELDS = 4;
const OFFSET_X = 16;
const OFFSET_Y = 16;

export default function FloatingDetailPanel({
  detail,
  titleField,
  subtitleField,
  detailFields,
  allItems,
  idField = "code",
}: FloatingDetailPanelProps) {
  const title = String(
    getNestedValue(detail.item, titleField) ?? ""
  );
  const subtitle = subtitleField
    ? String(getNestedValue(detail.item, subtitleField) ?? "")
    : "";
  const showSubtitle = subtitle && subtitle !== title;
  const visibleFields = detailFields.slice(0, MAX_FIELDS);

  return (
    <div
      data-testid="floating-detail-panel"
      style={{
        position: "fixed",
        left: detail.x + OFFSET_X,
        top: detail.y + OFFSET_Y,
        zIndex: 1100,
        pointerEvents: "none",
        maxWidth: 320,
      }}
      className="rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700 shadow-lg px-4 py-3 text-gray-100"
    >
      {title && (
        <h3
          className="text-sm font-bold truncate"
          data-testid="floating-detail-title"
        >
          {title}
        </h3>
      )}
      {showSubtitle && (
        <p
          className="text-xs text-gray-300 italic truncate"
          data-testid="floating-detail-subtitle"
        >
          {subtitle}
        </p>
      )}
      {visibleFields.length > 0 && (
        <div className="mt-2 space-y-2">
          {visibleFields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              item={detail.item}
              allItems={allItems}
              idField={idField}
              titleField={titleField}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
