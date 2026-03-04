import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi } from "vitest";
import { loadPlugins, validatePluginJson } from "./loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "__fixtures__");

function validPlugin(overrides: Record<string, unknown> = {}) {
  return {
    id: "test",
    name: "Test Plugin",
    description: "A test plugin",
    type: "regions",
    version: "1.0.0",
    icon: "globe",
    defaultColor: "#FF0000",
    categories: ["test"],
    dataType: "regions",
    dataSource: "static",
    category: "test",
    thumbnail: "#FF0000",
    ...overrides,
  };
}

describe("validatePluginJson", () => {
  it("accepts a valid plugin object with all fields", () => {
    expect(validatePluginJson(validPlugin())).toEqual([]);
  });

  it("accepts a valid plugin with optional schema field", () => {
    expect(
      validatePluginJson(validPlugin({ schema: "TestMetadata" }))
    ).toEqual([]);
  });

  it("rejects an object missing required fields", () => {
    const errors = validatePluginJson({ id: "incomplete", name: "Incomplete" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("description"))).toBe(true);
    expect(errors.some((e) => e.includes("type"))).toBe(true);
  });

  it("rejects missing dataType field", () => {
    const { dataType: _dataType, ...noDataType } = validPlugin();
    const errors = validatePluginJson(noDataType);
    expect(errors.some((e) => e.includes("dataType"))).toBe(true);
  });

  it("rejects missing dataSource field", () => {
    const { dataSource: _dataSource, ...noDataSource } = validPlugin();
    const errors = validatePluginJson(noDataSource);
    expect(errors.some((e) => e.includes("dataSource"))).toBe(true);
  });

  it("rejects missing category field", () => {
    const { category: _category, ...noCategory } = validPlugin();
    const errors = validatePluginJson(noCategory);
    expect(errors.some((e) => e.includes("category"))).toBe(true);
  });

  it("rejects missing thumbnail field", () => {
    const { thumbnail: _thumbnail, ...noThumbnail } = validPlugin();
    const errors = validatePluginJson(noThumbnail);
    expect(errors.some((e) => e.includes("thumbnail"))).toBe(true);
  });

  it("rejects an object with wrong types", () => {
    const errors = validatePluginJson(
      validPlugin({ categories: "not-an-array" })
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("categories"))).toBe(true);
  });

  it("rejects categories with non-string elements", () => {
    const errors = validatePluginJson(validPlugin({ categories: [1, 2, 3] }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("categories"))).toBe(true);
  });

  it("accepts dataType 'regions'", () => {
    expect(validatePluginJson(validPlugin({ dataType: "regions" }))).toEqual(
      []
    );
  });

  it("accepts dataType 'points'", () => {
    expect(validatePluginJson(validPlugin({ dataType: "points" }))).toEqual([]);
  });

  it("accepts dataType 'lines'", () => {
    expect(validatePluginJson(validPlugin({ dataType: "lines" }))).toEqual([]);
  });

  it("accepts dataType 'heatmap'", () => {
    expect(validatePluginJson(validPlugin({ dataType: "heatmap" }))).toEqual(
      []
    );
  });

  it("rejects invalid dataType value", () => {
    const errors = validatePluginJson(validPlugin({ dataType: "polygons" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("dataType"))).toBe(true);
    expect(
      errors.some((e) => e.includes("regions, points, lines, heatmap"))
    ).toBe(true);
  });

  it("rejects non-string dataType", () => {
    const errors = validatePluginJson(validPlugin({ dataType: 42 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("dataType"))).toBe(true);
  });

  it("accepts dataSource 'static'", () => {
    expect(validatePluginJson(validPlugin({ dataSource: "static" }))).toEqual(
      []
    );
  });

  it("accepts dataSource 'api'", () => {
    expect(validatePluginJson(validPlugin({ dataSource: "api" }))).toEqual([]);
  });

  it("rejects invalid dataSource value", () => {
    const errors = validatePluginJson(validPlugin({ dataSource: "database" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("dataSource"))).toBe(true);
    expect(errors.some((e) => e.includes("static, api"))).toBe(true);
  });

  it("rejects non-string dataSource", () => {
    const errors = validatePluginJson(validPlugin({ dataSource: true }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("dataSource"))).toBe(true);
  });

  it("rejects non-string schema when provided", () => {
    const errors = validatePluginJson(validPlugin({ schema: 123 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("schema"))).toBe(true);
  });
});

describe("loadPlugins", () => {
  it("loads valid plugins from a directory", () => {
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).toContain("languages");
    expect(ids).toContain("climate");
    expect(ids).toContain("cities");
    expect(ids).toContain("rivers");
  });

  it("returns correct metadata for a valid plugin with all fields", () => {
    const plugins = loadPlugins(FIXTURES);
    const languages = plugins.find((p) => p.id === "languages");
    expect(languages).toEqual({
      id: "languages",
      name: "World Languages",
      description: "Geographic regions of world languages",
      type: "regions",
      version: "1.0.0",
      icon: "globe",
      defaultColor: "#4A90D9",
      categories: ["linguistics", "culture"],
      dataType: "regions",
      dataSource: "static",
      category: "linguistics",
      thumbnail: "#4A90D9",
      schema: "LanguageMetadata",
    });
  });

  it("returns correct metadata for a plugin without optional schema", () => {
    const plugins = loadPlugins(FIXTURES);
    const climate = plugins.find((p) => p.id === "climate");
    expect(climate).toBeDefined();
    expect(climate!.schema).toBeUndefined();
    expect(climate!.dataType).toBe("regions");
    expect(climate!.dataSource).toBe("static");
    expect(climate!.category).toBe("geography");
    expect(climate!.thumbnail).toBe("#E74C3C");
  });

  it("loads plugins with points dataType", () => {
    const plugins = loadPlugins(FIXTURES);
    const cities = plugins.find((p) => p.id === "cities");
    expect(cities).toBeDefined();
    expect(cities!.dataType).toBe("points");
    expect(cities!.dataSource).toBe("api");
  });

  it("loads plugins with lines dataType", () => {
    const plugins = loadPlugins(FIXTURES);
    const rivers = plugins.find((p) => p.id === "rivers");
    expect(rivers).toBeDefined();
    expect(rivers!.dataType).toBe("lines");
    expect(rivers!.schema).toBe("RiverMetadata");
  });

  it("skips plugins with missing plugin.json", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).not.toContain("invalid-no-json");
    expect(
      warnSpy.mock.calls.some(([msg]) =>
        String(msg).includes("invalid-no-json")
      )
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it("skips plugins with invalid JSON", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).not.toContain("invalid-bad-json");
    expect(
      warnSpy.mock.calls.some(([msg]) =>
        String(msg).includes("invalid-bad-json")
      )
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it("skips plugins with missing required fields", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).not.toContain("incomplete");
    expect(
      warnSpy.mock.calls.some(([msg]) =>
        String(msg).includes("invalid-missing-fields")
      )
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it("skips plugins with wrong field types", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).not.toContain("wrong-types");
    expect(
      warnSpy.mock.calls.some(([msg]) =>
        String(msg).includes("invalid-wrong-types")
      )
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it("skips plugins with invalid dataType", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).not.toContain("bad-datatype");
    expect(
      warnSpy.mock.calls.some(([msg]) =>
        String(msg).includes("invalid-bad-datatype")
      )
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it("skips plugins with invalid dataSource", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).not.toContain("bad-datasource");
    expect(
      warnSpy.mock.calls.some(([msg]) =>
        String(msg).includes("invalid-bad-datasource")
      )
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it("returns an empty array for a non-existent directory", () => {
    const plugins = loadPlugins("/nonexistent/path");
    expect(plugins).toEqual([]);
  });

  it("only returns valid plugins and skips all invalid ones", () => {
    const plugins = loadPlugins(FIXTURES);
    // 4 valid + 6 invalid fixtures
    expect(plugins).toHaveLength(4);
  });
});
