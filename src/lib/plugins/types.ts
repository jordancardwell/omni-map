export const VALID_DATA_TYPES = ["regions", "points", "lines", "heatmap"] as const;
export type PluginDataType = (typeof VALID_DATA_TYPES)[number];

export const VALID_DATA_SOURCES = ["static", "api"] as const;
export type PluginDataSource = (typeof VALID_DATA_SOURCES)[number];

export const VALID_FIELD_TYPES = [
  "text",
  "number",
  "formatted-number",
  "list",
  "tags",
  "links",
  "status-badge",
  "markdown",
  "utc-clock",
] as const;
export type FieldType = (typeof VALID_FIELD_TYPES)[number];

export interface DetailField {
  key: string;
  label: string;
  type: FieldType;
  statusColors?: Record<string, string>;
  referenceItems?: boolean;
}

export interface SidebarConfig {
  idField: string;
  searchFields: string[];
  groupBy?: string;
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  badgeFormat?: "text" | "formatted-number";
}

export interface DetailPanelConfig {
  titleField: string;
  subtitleField?: string;
}

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  icon: string;
  defaultColor: string;
  categories: string[];
  dataType: PluginDataType;
  dataSource: PluginDataSource;
  category: string;
  thumbnail: string;
  schema?: string;
  detailFields?: DetailField[];
  sidebarConfig?: SidebarConfig;
  detailPanelConfig?: DetailPanelConfig;
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
  "dataType",
  "dataSource",
  "category",
  "thumbnail",
];
