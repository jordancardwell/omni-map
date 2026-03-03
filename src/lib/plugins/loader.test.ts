import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi } from "vitest";
import { loadPlugins, validatePluginJson } from "./loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "__fixtures__");

describe("validatePluginJson", () => {
  it("accepts a valid plugin object", () => {
    const valid = {
      id: "test",
      name: "Test Plugin",
      description: "A test plugin",
      type: "regions",
      version: "1.0.0",
      icon: "globe",
      defaultColor: "#FF0000",
      categories: ["test"],
    };
    expect(validatePluginJson(valid)).toEqual([]);
  });

  it("rejects an object missing required fields", () => {
    const errors = validatePluginJson({ id: "incomplete", name: "Incomplete" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("description"))).toBe(true);
    expect(errors.some((e) => e.includes("type"))).toBe(true);
  });

  it("rejects an object with wrong types", () => {
    const errors = validatePluginJson({
      id: "test",
      name: "Test",
      description: "Desc",
      type: "regions",
      version: "1.0.0",
      icon: "globe",
      defaultColor: "#000",
      categories: "not-an-array",
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("categories"))).toBe(true);
  });

  it("rejects categories with non-string elements", () => {
    const errors = validatePluginJson({
      id: "test",
      name: "Test",
      description: "Desc",
      type: "regions",
      version: "1.0.0",
      icon: "globe",
      defaultColor: "#000",
      categories: [1, 2, 3],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("categories"))).toBe(true);
  });
});

describe("loadPlugins", () => {
  it("loads valid plugins from a directory", () => {
    const plugins = loadPlugins(FIXTURES);
    const ids = plugins.map((p) => p.id);
    expect(ids).toContain("languages");
    expect(ids).toContain("climate");
  });

  it("returns correct metadata for a valid plugin", () => {
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
    });
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

  it("returns an empty array for a non-existent directory", () => {
    const plugins = loadPlugins("/nonexistent/path");
    expect(plugins).toEqual([]);
  });

  it("only returns valid plugins and skips all invalid ones", () => {
    const plugins = loadPlugins(FIXTURES);
    // There are 2 valid + 4 invalid fixtures
    expect(plugins).toHaveLength(2);
  });
});
