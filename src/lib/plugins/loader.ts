import fs from "node:fs";
import path from "node:path";
import { REQUIRED_PLUGIN_FIELDS, type PluginMetadata } from "./types";

/**
 * Validates that a parsed plugin.json object has all required fields
 * with correct types. Returns an array of error messages (empty if valid).
 */
export function validatePluginJson(
  data: Record<string, unknown>
): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_PLUGIN_FIELDS) {
    if (!(field in data)) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  if (errors.length > 0) return errors;

  // Type checks for present fields
  const stringFields = [
    "id",
    "name",
    "description",
    "type",
    "version",
    "icon",
    "defaultColor",
  ] as const;

  for (const field of stringFields) {
    if (typeof data[field] !== "string") {
      errors.push(`Field "${field}" must be a string`);
    }
  }

  if (!Array.isArray(data.categories)) {
    errors.push(`Field "categories" must be an array`);
  } else if (!data.categories.every((c: unknown) => typeof c === "string")) {
    errors.push(`Field "categories" must be an array of strings`);
  }

  return errors;
}

/**
 * Scans a plugins directory and loads all valid plugins.
 * Invalid plugins are skipped with a console warning.
 */
export function loadPlugins(pluginsDir: string): PluginMetadata[] {
  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  const plugins: PluginMetadata[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = path.join(pluginsDir, entry.name);
    const pluginJsonPath = path.join(pluginDir, "plugin.json");

    if (!fs.existsSync(pluginJsonPath)) {
      console.warn(
        `Plugin "${entry.name}": skipped — missing plugin.json`
      );
      continue;
    }

    let data: Record<string, unknown>;
    try {
      const raw = fs.readFileSync(pluginJsonPath, "utf-8");
      data = JSON.parse(raw);
    } catch {
      console.warn(
        `Plugin "${entry.name}": skipped — invalid JSON in plugin.json`
      );
      continue;
    }

    const errors = validatePluginJson(data);
    if (errors.length > 0) {
      console.warn(
        `Plugin "${entry.name}": skipped — ${errors.join(", ")}`
      );
      continue;
    }

    plugins.push({
      id: data.id as string,
      name: data.name as string,
      description: data.description as string,
      type: data.type as string,
      version: data.version as string,
      icon: data.icon as string,
      defaultColor: data.defaultColor as string,
      categories: data.categories as string[],
    });
  }

  return plugins;
}
