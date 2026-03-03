import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { validateLanguageMetadata, isLanguageMetadata } from "./language-schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..", "..");
const LANGUAGES_DIR = path.join(ROOT, "plugins", "languages");
const DATA_DIR = path.join(LANGUAGES_DIR, "data");
const GEO_DIR = path.join(LANGUAGES_DIR, "geo");

const SAMPLE_LANGUAGES = [
  "en", "zh", "es", "ar", "hi",
  "fr", "de", "pt", "ru", "it",
  "nl", "pl", "bn", "pa", "uk",
  "ro", "el", "cs", "sv", "fa",
  "ja", "ko", "yue", "bo", "my",
  "th", "vi", "km", "lo", "ms",
  "id", "tl",
  "he", "am", "ha", "so",
  "ta", "te", "kn", "ml",
  "tr", "az", "uz", "kk",
  "sw", "yo", "ig", "zu", "xh",
  "jv", "su", "haw", "mi",
  "fi", "hu", "ka",
];

function loadLanguageData(code: string): Record<string, unknown> {
  const filePath = path.join(DATA_DIR, `${code}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

describe("validateLanguageMetadata", () => {
  it("accepts a fully valid language object", () => {
    const valid: Record<string, unknown> = {
      code: "en",
      name: "English",
      nativeName: "English",
      family: "Indo-European",
      branch: "Germanic",
      speakers: { native: 380000000, total: 1500000000, source: "Ethnologue 2024" },
      regions: ["GB", "US"],
      writingSystem: "Latin",
      dialects: ["American English", "British English"],
      endangermentStatus: "safe",
      description: "A widely spoken language.",
      historicalNotes: "Evolved from Old English.",
      relatedLanguages: ["de", "nl"],
      resources: [{ title: "Ethnologue", url: "https://www.ethnologue.com" }],
      geojson: "en.geojson",
    };
    expect(validateLanguageMetadata(valid)).toEqual([]);
  });

  it("rejects an object missing required fields", () => {
    const errors = validateLanguageMetadata({ code: "xx", name: "Incomplete" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("family"))).toBe(true);
    expect(errors.some((e) => e.includes("speakers"))).toBe(true);
  });

  it("rejects invalid speakers object", () => {
    const data = {
      ...loadLanguageData("en"),
      speakers: "not-an-object",
    };
    const errors = validateLanguageMetadata(data);
    expect(errors.some((e) => e.includes("speakers"))).toBe(true);
  });

  it("rejects speakers with wrong inner types", () => {
    const data = {
      ...loadLanguageData("en"),
      speakers: { native: "many", total: "lots", source: 42 },
    };
    const errors = validateLanguageMetadata(data);
    expect(errors.some((e) => e.includes("speakers.native"))).toBe(true);
    expect(errors.some((e) => e.includes("speakers.total"))).toBe(true);
    expect(errors.some((e) => e.includes("speakers.source"))).toBe(true);
  });

  it("rejects non-array regions", () => {
    const data = {
      ...loadLanguageData("en"),
      regions: "not-an-array",
    };
    const errors = validateLanguageMetadata(data);
    expect(errors.some((e) => e.includes("regions"))).toBe(true);
  });

  it("rejects regions with non-string elements", () => {
    const data = {
      ...loadLanguageData("en"),
      regions: [1, 2, 3],
    };
    const errors = validateLanguageMetadata(data);
    expect(errors.some((e) => e.includes("regions"))).toBe(true);
  });

  it("rejects invalid resources array", () => {
    const data = {
      ...loadLanguageData("en"),
      resources: [{ title: 123, url: null }],
    };
    const errors = validateLanguageMetadata(data);
    expect(errors.some((e) => e.includes("resources"))).toBe(true);
  });

  it("rejects non-array resources", () => {
    const data = {
      ...loadLanguageData("en"),
      resources: "not-an-array",
    };
    const errors = validateLanguageMetadata(data);
    expect(errors.some((e) => e.includes("resources"))).toBe(true);
  });
});

describe("isLanguageMetadata", () => {
  it("returns true for valid data", () => {
    const data = loadLanguageData("en");
    expect(isLanguageMetadata(data)).toBe(true);
  });

  it("returns false for invalid data", () => {
    expect(isLanguageMetadata({ code: "xx" })).toBe(false);
  });
});

describe("sample language data files", () => {
  it.each(SAMPLE_LANGUAGES)("validates %s metadata against schema", (code) => {
    const data = loadLanguageData(code);
    const errors = validateLanguageMetadata(data);
    expect(errors, `${code}.json validation errors: ${errors.join(", ")}`).toEqual([]);
  });

  it.each(SAMPLE_LANGUAGES)("%s has a valid ISO 639 code", (code) => {
    const data = loadLanguageData(code);
    expect(data.code).toBe(code);
  });

  it.each(SAMPLE_LANGUAGES)("%s has non-empty name and nativeName", (code) => {
    const data = loadLanguageData(code);
    expect((data.name as string).length).toBeGreaterThan(0);
    expect((data.nativeName as string).length).toBeGreaterThan(0);
  });

  it.each(SAMPLE_LANGUAGES)("%s has positive speaker counts", (code) => {
    const data = loadLanguageData(code);
    const speakers = data.speakers as { native: number; total: number };
    expect(speakers.native).toBeGreaterThan(0);
    expect(speakers.total).toBeGreaterThan(0);
    expect(speakers.total).toBeGreaterThanOrEqual(speakers.native);
  });

  it.each(SAMPLE_LANGUAGES)("%s has at least one region", (code) => {
    const data = loadLanguageData(code);
    expect((data.regions as string[]).length).toBeGreaterThan(0);
  });

  it.each(SAMPLE_LANGUAGES)("%s has at least one dialect", (code) => {
    const data = loadLanguageData(code);
    expect((data.dialects as string[]).length).toBeGreaterThan(0);
  });

  it.each(SAMPLE_LANGUAGES)("%s has at least one resource with title and url", (code) => {
    const data = loadLanguageData(code);
    const resources = data.resources as Array<{ title: string; url: string }>;
    expect(resources.length).toBeGreaterThan(0);
    for (const resource of resources) {
      expect(resource.title.length).toBeGreaterThan(0);
      expect(resource.url).toMatch(/^https?:\/\//);
    }
  });

  it.each(SAMPLE_LANGUAGES)("%s references an existing GeoJSON file", (code) => {
    const data = loadLanguageData(code);
    const geojsonPath = path.join(GEO_DIR, data.geojson as string);
    expect(fs.existsSync(geojsonPath)).toBe(true);
  });

  it.each(SAMPLE_LANGUAGES)("%s GeoJSON is valid and under 500KB", (code) => {
    const data = loadLanguageData(code);
    const geojsonPath = path.join(GEO_DIR, data.geojson as string);
    const stat = fs.statSync(geojsonPath);
    expect(stat.size).toBeLessThan(500 * 1024);

    const geojson = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"));
    expect(geojson.type).toBe("FeatureCollection");
    expect(Array.isArray(geojson.features)).toBe(true);
    expect(geojson.features.length).toBeGreaterThan(0);
  });
});

describe("plugin.json", () => {
  it("exists and has correct configuration", () => {
    const pluginJson = JSON.parse(
      fs.readFileSync(path.join(LANGUAGES_DIR, "plugin.json"), "utf-8")
    );
    expect(pluginJson.type).toBe("regions");
    expect(pluginJson.name).toBe("World Languages");
    expect(pluginJson.id).toBe("languages");
  });
});
