/**
 * Utility functions for the generic plugin system.
 * Provides dot-path field access and value formatting
 * used by GenericSidebar, GenericDetailPanel, and FieldRenderer.
 */

/**
 * Access a nested value in an object using a dot-separated path.
 * e.g., getFieldValue(item, "speakers.total") returns item.speakers.total
 */
export function getFieldValue(
  item: Record<string, unknown>,
  path: string
): unknown {
  return path.split(".").reduce<unknown>((obj, key) => {
    if (obj != null && typeof obj === "object") {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, item);
}

/**
 * Format a number with locale-aware abbreviations (B, M, K).
 */
export function formatCompactNumber(count: number): string {
  if (count >= 1_000_000_000) {
    const value = count / 1_000_000_000;
    return `${parseFloat(value.toFixed(1))}B`;
  }
  if (count >= 1_000_000) {
    return `${Math.round(count / 1_000_000)}M`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  return count.toString();
}

/**
 * Given a list of unique group names and a plugin palette,
 * return a stable color mapping for each group.
 */
export function buildGroupColorMap(
  groups: string[],
  palette: string[]
): Record<string, string> {
  const sorted = [...groups].sort();
  const map: Record<string, string> = {};
  for (let i = 0; i < sorted.length; i++) {
    map[sorted[i]] = palette[i % palette.length];
  }
  return map;
}
