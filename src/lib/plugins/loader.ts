import fs from "node:fs";
import path from "node:path";
import {
  REQUIRED_PLUGIN_FIELDS,
  VALID_DATA_TYPES,
  VALID_DATA_SOURCES,
  VALID_FIELD_TYPES,
  type PluginMetadata,
  type DetailField,
  type SidebarConfig,
  type DetailPanelConfig,
} from "./types";

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
    "category",
    "thumbnail",
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

  // Validate dataType enum
  if (typeof data.dataType !== "string") {
    errors.push(`Field "dataType" must be a string`);
  } else if (!VALID_DATA_TYPES.includes(data.dataType as typeof VALID_DATA_TYPES[number])) {
    errors.push(
      `Field "dataType" must be one of: ${VALID_DATA_TYPES.join(", ")}`
    );
  }

  // Validate dataSource enum
  if (typeof data.dataSource !== "string") {
    errors.push(`Field "dataSource" must be a string`);
  } else if (!VALID_DATA_SOURCES.includes(data.dataSource as typeof VALID_DATA_SOURCES[number])) {
    errors.push(
      `Field "dataSource" must be one of: ${VALID_DATA_SOURCES.join(", ")}`
    );
  }

  // Validate optional schema field
  if ("schema" in data && typeof data.schema !== "string") {
    errors.push(`Field "schema" must be a string`);
  }

  // Validate optional detailFields
  if ("detailFields" in data) {
    if (!Array.isArray(data.detailFields)) {
      errors.push(`Field "detailFields" must be an array`);
    } else {
      for (let i = 0; i < data.detailFields.length; i++) {
        const field = data.detailFields[i] as Record<string, unknown>;
        if (typeof field.key !== "string") {
          errors.push(`detailFields[${i}].key must be a string`);
        }
        if (typeof field.label !== "string") {
          errors.push(`detailFields[${i}].label must be a string`);
        }
        if (
          typeof field.type !== "string" ||
          !VALID_FIELD_TYPES.includes(
            field.type as (typeof VALID_FIELD_TYPES)[number]
          )
        ) {
          errors.push(
            `detailFields[${i}].type must be one of: ${VALID_FIELD_TYPES.join(", ")}`
          );
        }
      }
    }
  }

  // Validate optional sidebarConfig
  if ("sidebarConfig" in data) {
    const sc = data.sidebarConfig as Record<string, unknown>;
    if (typeof sc !== "object" || sc === null) {
      errors.push(`Field "sidebarConfig" must be an object`);
    } else {
      if (typeof sc.idField !== "string") {
        errors.push(`sidebarConfig.idField must be a string`);
      }
      if (!Array.isArray(sc.searchFields)) {
        errors.push(`sidebarConfig.searchFields must be an array`);
      }
      if (typeof sc.titleField !== "string") {
        errors.push(`sidebarConfig.titleField must be a string`);
      }
    }
  }

  // Validate optional detailPanelConfig
  if ("detailPanelConfig" in data) {
    const dpc = data.detailPanelConfig as Record<string, unknown>;
    if (typeof dpc !== "object" || dpc === null) {
      errors.push(`Field "detailPanelConfig" must be an object`);
    } else {
      if (typeof dpc.titleField !== "string") {
        errors.push(`detailPanelConfig.titleField must be a string`);
      }
    }
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

    const metadata: PluginMetadata = {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string,
      type: data.type as string,
      version: data.version as string,
      icon: data.icon as string,
      defaultColor: data.defaultColor as string,
      categories: data.categories as string[],
      dataType: data.dataType as PluginMetadata["dataType"],
      dataSource: data.dataSource as PluginMetadata["dataSource"],
      category: data.category as string,
      thumbnail: data.thumbnail as string,
    };
    if (typeof data.schema === "string") {
      metadata.schema = data.schema;
    }
    if (Array.isArray(data.detailFields)) {
      metadata.detailFields = data.detailFields as DetailField[];
    }
    if (data.sidebarConfig && typeof data.sidebarConfig === "object") {
      metadata.sidebarConfig = data.sidebarConfig as SidebarConfig;
    }
    if (data.detailPanelConfig && typeof data.detailPanelConfig === "object") {
      metadata.detailPanelConfig = data.detailPanelConfig as DetailPanelConfig;
    }
    plugins.push(metadata);
  }

  return plugins;
}
