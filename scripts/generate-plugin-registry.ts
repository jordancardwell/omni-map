import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlugins } from "../src/lib/plugins/loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const pluginsDir = path.join(ROOT, "plugins");
const generatedDir = path.join(ROOT, "src", "generated");

fs.mkdirSync(generatedDir, { recursive: true });

const plugins = loadPlugins(pluginsDir);
const outputPath = path.join(generatedDir, "plugin-registry.json");
fs.writeFileSync(outputPath, JSON.stringify(plugins, null, 2) + "\n");
console.log(
  `Plugin registry generated: ${plugins.length} plugin(s) → ${outputPath}`
);

// For each plugin, generate a data registry if it has a data/ directory
for (const plugin of plugins) {
  const dataDir = path.join(pluginsDir, plugin.id, "data");
  if (fs.existsSync(dataDir)) {
    const files = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    const items = files.map((f) => {
      const raw = fs.readFileSync(path.join(dataDir, f), "utf-8");
      return JSON.parse(raw);
    });
    const registryPath = path.join(
      generatedDir,
      `${plugin.id}-registry.json`
    );
    const content = JSON.stringify(items, null, 2) + "\n";
    fs.writeFileSync(registryPath, content);
    console.log(
      `${plugin.id} registry generated: ${items.length} item(s) → ${registryPath}`
    );

    // Backwards compat: write language-registry.json alias for languages plugin
    if (plugin.id === "languages") {
      const legacyPath = path.join(generatedDir, "language-registry.json");
      fs.writeFileSync(legacyPath, content);
    }
  }

  // Copy GeoJSON files for static plugins to public/geo/{plugin-id}/
  if (plugin.dataSource === "static") {
    const geoDir = path.join(pluginsDir, plugin.id, "geo");
    if (fs.existsSync(geoDir)) {
      const destDir = path.join(ROOT, "public", "geo", plugin.id);
      fs.mkdirSync(destDir, { recursive: true });
      const geoFiles = fs
        .readdirSync(geoDir)
        .filter((f) => f.endsWith(".geojson"));
      for (const f of geoFiles) {
        fs.copyFileSync(path.join(geoDir, f), path.join(destDir, f));
      }
      console.log(
        `GeoJSON files copied: ${geoFiles.length} file(s) → ${destDir}`
      );

      // Backwards compat: also copy language geo files to public/geo/ root
      if (plugin.id === "languages") {
        const legacyDestDir = path.join(ROOT, "public", "geo");
        for (const f of geoFiles) {
          fs.copyFileSync(
            path.join(geoDir, f),
            path.join(legacyDestDir, f)
          );
        }
      }
    }
  }
}
