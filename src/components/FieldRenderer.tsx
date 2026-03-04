"use client";

import { useState, useEffect } from "react";
import type { DetailField } from "@/lib/plugins/types";
import { getFieldValue } from "@/lib/plugin-utils";

interface FieldRendererProps {
  field: DetailField;
  item: Record<string, unknown>;
  allItems?: Record<string, unknown>[];
  idField?: string;
  titleField?: string;
  onSelectItem?: (id: string) => void;
}

export default function FieldRenderer({
  field,
  item,
  allItems = [],
  idField = "code",
  titleField = "name",
  onSelectItem,
}: FieldRendererProps) {
  const value = getFieldValue(item, field.key);

  if (value == null || value === "") return null;

  return (
    <section data-testid={`field-${field.key}`}>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {field.label}
      </h3>
      <div>{renderValue(field, value, allItems, idField, titleField, onSelectItem)}</div>
    </section>
  );
}

function renderValue(
  field: DetailField,
  value: unknown,
  allItems: Record<string, unknown>[],
  idField: string,
  titleField: string,
  onSelectItem?: (id: string) => void
): React.ReactNode {
  switch (field.type) {
    case "text":
      return <p className="text-sm text-gray-300 leading-relaxed">{String(value)}</p>;

    case "number":
      return <p className="text-sm text-gray-300">{String(value)}</p>;

    case "formatted-number": {
      const num = typeof value === "number" ? value : Number(value);
      return (
        <p className="text-sm text-gray-300">
          {isNaN(num) ? String(value) : num.toLocaleString()}
        </p>
      );
    }

    case "list": {
      if (!Array.isArray(value)) return <p className="text-sm text-gray-300">{String(value)}</p>;
      return (
        <ul className="text-sm text-gray-300 list-disc list-inside space-y-0.5">
          {value.map((item, i) => (
            <li key={i}>{String(item)}</li>
          ))}
        </ul>
      );
    }

    case "tags": {
      if (!Array.isArray(value)) return <p className="text-sm text-gray-300">{String(value)}</p>;

      if (field.referenceItems && onSelectItem) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v) => {
              const id = String(v);
              const referenced = allItems.find(
                (it) => String(getFieldValue(it, idField)) === id
              );
              const label = referenced
                ? String(getFieldValue(referenced, titleField))
                : null;
              if (!label) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelectItem(id)}
                  className="text-xs px-3 py-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors min-h-[44px] flex items-center"
                  data-testid={`field-ref-${id}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        );
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300"
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }

    case "links": {
      if (!Array.isArray(value)) return null;
      return (
        <div className="space-y-1.5">
          {value.map((link, i) => {
            const title =
              typeof link === "object" && link !== null
                ? String((link as Record<string, unknown>).title ?? "")
                : String(link);
            const url =
              typeof link === "object" && link !== null
                ? String((link as Record<string, unknown>).url ?? "#")
                : "#";
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors min-h-[44px] flex items-center"
              >
                {title} ↗
              </a>
            );
          })}
        </div>
      );
    }

    case "status-badge": {
      const status = String(value);
      const color = field.statusColors?.[status.toLowerCase()] ?? "#9ca3af";
      return (
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            data-testid={`field-status-indicator-${field.key}`}
          />
          <span className="text-sm capitalize">{status}</span>
        </div>
      );
    }

    case "markdown":
      return (
        <p className="text-sm text-gray-300 leading-relaxed">{String(value)}</p>
      );

    case "utc-clock":
      return <UtcClock offsetHours={Number(value)} />;

    default:
      return <p className="text-sm text-gray-300">{String(value)}</p>;
  }
}

function UtcClock({ offsetHours }: { offsetHours: number }) {
  const [time, setTime] = useState(() => formatUtcTime(offsetHours));

  useEffect(() => {
    const id = setInterval(() => setTime(formatUtcTime(offsetHours)), 1000);
    return () => clearInterval(id);
  }, [offsetHours]);

  return (
    <p className="text-sm text-gray-300 font-mono tabular-nums" data-testid="utc-clock">
      {time}
    </p>
  );
}

function formatUtcTime(offsetHours: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const local = new Date(utcMs + offsetHours * 3_600_000);
  const h = local.getHours().toString().padStart(2, "0");
  const m = local.getMinutes().toString().padStart(2, "0");
  const s = local.getSeconds().toString().padStart(2, "0");
  const dateStr = local.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${h}:${m}:${s} — ${dateStr}`;
}
