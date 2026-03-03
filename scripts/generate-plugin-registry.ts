import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlugins } from "../src/lib/plugins/loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const pluginsDir = path.join(ROOT, "plugins");
const generatedDir = path.join(ROOT, "src", "generated");
const outputPath = path.join(generatedDir, "plugin-registry.json");

fs.mkdirSync(generatedDir, { recursive: true });

const plugins = loadPlugins(pluginsDir);
fs.writeFileSync(outputPath, JSON.stringify(plugins, null, 2) + "\n");
console.log(
  `Plugin registry generated: ${plugins.length} plugin(s) → ${outputPath}`
);

// Generate language registry from language plugin data files
const languagesDataDir = path.join(pluginsDir, "languages", "data");
if (fs.existsSync(languagesDataDir)) {
  const files = fs
    .readdirSync(languagesDataDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const languages = files.map((f) => {
    const raw = fs.readFileSync(path.join(languagesDataDir, f), "utf-8");
    return JSON.parse(raw);
  });
  const langRegistryPath = path.join(generatedDir, "language-registry.json");
  fs.writeFileSync(langRegistryPath, JSON.stringify(languages, null, 2) + "\n");
  console.log(
    `Language registry generated: ${languages.length} language(s) → ${langRegistryPath}`
  );
}

// Copy GeoJSON files to public/geo/ for lazy-loading at runtime
const geoSrcDir = path.join(pluginsDir, "languages", "geo");
const geoDestDir = path.join(ROOT, "public", "geo");
if (fs.existsSync(geoSrcDir)) {
  fs.mkdirSync(geoDestDir, { recursive: true });
  const geoFiles = fs
    .readdirSync(geoSrcDir)
    .filter((f) => f.endsWith(".geojson"));
  for (const f of geoFiles) {
    fs.copyFileSync(path.join(geoSrcDir, f), path.join(geoDestDir, f));
  }
  console.log(
    `GeoJSON files copied: ${geoFiles.length} file(s) → ${geoDestDir}`
  );
}
