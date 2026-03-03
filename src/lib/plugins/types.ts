export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  icon: string;
  defaultColor: string;
  categories: string[];
}

export const REQUIRED_PLUGIN_FIELDS: (keyof PluginMetadata)[] = [
  "id",
  "name",
  "description",
  "type",
  "version",
  "icon",
  "defaultColor",
  "categories",
];
