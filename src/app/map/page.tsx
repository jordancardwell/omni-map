"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";
import { getFieldValue, buildGroupColorMap } from "@/lib/plugin-utils";
import { getPluginPalette } from "@/lib/language-utils";
import GenericSidebar from "@/components/GenericSidebar";
import type { PluginPanel } from "@/components/GenericSidebar";
import GenericDetailPanel from "@/components/GenericDetailPanel";
import OverlayLegend from "@/components/OverlayLegend";
import type { LanguageOverlay } from "@/components/MapView";
import pluginRegistry from "@/generated/plugin-registry.json";
import languageRegistry from "@/generated/language-registry.json";
import religionsRegistry from "@/generated/religions-registry.json";
import writingSystemsRegistry from "@/generated/writing-systems-registry.json";
import currenciesRegistry from "@/generated/currencies-registry.json";
import powerGridsRegistry from "@/generated/power-grids-registry.json";
import internetSpeedRegistry from "@/generated/internet-speed-registry.json";
import traditionalMedicineRegistry from "@/generated/traditional-medicine-registry.json";
import tectonicPlatesRegistry from "@/generated/tectonic-plates-registry.json";
import biomesRegistry from "@/generated/biomes-registry.json";
import climateZonesRegistry from "@/generated/climate-zones-registry.json";
import biodiversityHotspotsRegistry from "@/generated/biodiversity-hotspots-registry.json";
import timeZonesRegistry from "@/generated/time-zones-registry.json";
import volcanoesRegistry from "@/generated/volcanoes-registry.json";
import unescoSitesRegistry from "@/generated/unesco-sites-registry.json";
import lightPollutionRegistry from "@/generated/light-pollution-registry.json";
import type { PluginMetadata } from "@/lib/plugins/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// Plugin data registries keyed by plugin ID
const pluginDataRegistries: Record<string, Record<string, unknown>[]> = {
  languages: languageRegistry as unknown as Record<string, unknown>[],
  religions: religionsRegistry as unknown as Record<string, unknown>[],
  "writing-systems": writingSystemsRegistry as unknown as Record<string, unknown>[],
  currencies: currenciesRegistry as unknown as Record<string, unknown>[],
  "power-grids": powerGridsRegistry as unknown as Record<string, unknown>[],
  "internet-speed": internetSpeedRegistry as unknown as Record<string, unknown>[],
  "traditional-medicine": traditionalMedicineRegistry as unknown as Record<string, unknown>[],
  "tectonic-plates": tectonicPlatesRegistry as unknown as Record<string, unknown>[],
  biomes: biomesRegistry as unknown as Record<string, unknown>[],
  "climate-zones": climateZonesRegistry as unknown as Record<string, unknown>[],
  "biodiversity-hotspots": biodiversityHotspotsRegistry as unknown as Record<string, unknown>[],
  "time-zones": timeZonesRegistry as unknown as Record<string, unknown>[],
  volcanoes: volcanoesRegistry as unknown as Record<string, unknown>[],
  "unesco-sites": unescoSitesRegistry as unknown as Record<string, unknown>[],
  "light-pollution": lightPollutionRegistry as unknown as Record<string, unknown>[],
};

const plugins = pluginRegistry as unknown as PluginMetadata[];

export default function MapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeItems, setActiveItems] = useState<Record<string, Set<string>>>(
    {}
  );
  const [geoJsonCache, setGeoJsonCache] = useState<
    Record<string, FeatureCollection>
  >({});
  const [overlayOpacity, setOverlayOpacity] = useState<Record<string, number>>(
    {}
  );
  const [selectedItem, setSelectedItem] = useState<{
    pluginId: string;
    item: Record<string, unknown>;
  } | null>(null);
  const [activePluginTab, setActivePluginTab] = useState<string>(
    plugins[0]?.id ?? ""
  );
  const [previewOverlay, setPreviewOverlay] = useState<LanguageOverlay | null>(null);
  const initializedRef = useRef(false);

  // All active item codes across all plugins (flattened for URL sync)
  const allActiveCodes = useMemo(() => {
    const codes: string[] = [];
    for (const items of Object.values(activeItems)) {
      codes.push(...items);
    }
    return codes;
  }, [activeItems]);

  // Sync active overlays to URL query params
  useEffect(() => {
    if (!initializedRef.current) return;
    const codes = [...allActiveCodes].sort();
    const params = new URLSearchParams();
    if (codes.length > 0) {
      params.set("overlays", codes.join(","));
    }
    const search = params.toString();
    const newUrl = search ? `?${search}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [allActiveCodes, router]);

  // Pre-select overlays from query params on mount
  useEffect(() => {
    const overlaysParam = searchParams.get("overlays");
    const overlayParam = searchParams.get("overlay");

    const codes: string[] = [];
    if (overlaysParam) {
      codes.push(
        ...overlaysParam
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      );
    } else if (overlayParam) {
      codes.push(overlayParam.trim());
    }

    for (const code of codes) {
      for (const plugin of plugins) {
        const registry = pluginDataRegistries[plugin.id];
        if (!registry) continue;
        const idField = plugin.sidebarConfig?.idField ?? "code";
        const found = registry.find(
          (item) => String(getFieldValue(item, idField)) === code
        );
        if (found) {
          handleToggleItem(plugin.id, code);
          break;
        }
      }
    }

    initializedRef.current = true;
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleItem = async (pluginId: string, itemId: string) => {
    setActiveItems((prev) => {
      const pluginItems = new Set(prev[pluginId] ?? []);
      if (pluginItems.has(itemId)) {
        pluginItems.delete(itemId);
      } else {
        pluginItems.add(itemId);
      }
      return { ...prev, [pluginId]: pluginItems };
    });

    if (!geoJsonCache[itemId]) {
      // Try generic path first, fallback to legacy
      try {
        const response = await fetch(`/geo/${pluginId}/${itemId}.geojson`);
        if (response.ok) {
          const data = await response.json();
          setGeoJsonCache((prev) => ({ ...prev, [itemId]: data }));
          return;
        }
      } catch {
        // ignore
      }
      try {
        const response = await fetch(`/geo/${itemId}.geojson`);
        if (response.ok) {
          const data = await response.json();
          setGeoJsonCache((prev) => ({ ...prev, [itemId]: data }));
        }
      } catch {
        // GeoJSON load failed silently
      }
    }
  };

  const handleChangeOpacity = useCallback((code: string, opacity: number) => {
    setOverlayOpacity((prev) => ({ ...prev, [code]: opacity }));
  }, []);

  const handleSelectItem = useCallback(
    (pluginId: string, itemId: string) => {
      const registry = pluginDataRegistries[pluginId];
      if (!registry) return;
      const plugin = plugins.find((p) => p.id === pluginId);
      const idField = plugin?.sidebarConfig?.idField ?? "code";
      const item = registry.find(
        (it) => String(getFieldValue(it, idField)) === itemId
      );
      if (item) setSelectedItem({ pluginId, item });
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Fetch GeoJSON for an item (reuses cache)
  const fetchGeoJson = useCallback(async (pluginId: string, itemId: string): Promise<FeatureCollection | null> => {
    if (geoJsonCache[itemId]) return geoJsonCache[itemId];
    try {
      const res = await fetch(`/geo/${pluginId}/${itemId}.geojson`);
      if (res.ok) {
        const data = await res.json();
        setGeoJsonCache((prev) => ({ ...prev, [itemId]: data }));
        return data;
      }
    } catch { /* ignore */ }
    try {
      const res = await fetch(`/geo/${itemId}.geojson`);
      if (res.ok) {
        const data = await res.json();
        setGeoJsonCache((prev) => ({ ...prev, [itemId]: data }));
        return data;
      }
    } catch { /* ignore */ }
    return null;
  }, [geoJsonCache]);

  const handleHoverItem = useCallback(async (pluginId: string, itemId: string) => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (!plugin) return;
    const registry = pluginDataRegistries[pluginId];
    if (!registry) return;
    const idField = plugin.sidebarConfig?.idField ?? "code";
    const item = registry.find((it) => String(getFieldValue(it, idField)) === itemId);
    if (!item) return;

    const data = await fetchGeoJson(pluginId, itemId);
    if (!data) return;

    const groupBy = plugin.sidebarConfig?.groupBy;
    const groupNames = groupBy
      ? [...new Set(registry.map((it) => String(getFieldValue(it, groupBy) ?? "Other")))]
      : [];
    const palette = getPluginPalette(pluginId);
    const colorMap = groupBy ? buildGroupColorMap(groupNames, palette) : {};
    const groupKey = groupBy ? String(getFieldValue(item, groupBy) ?? "Other") : "";
    const color = colorMap[groupKey] ?? plugin.defaultColor ?? palette[0] ?? "#888888";

    setPreviewOverlay({
      code: itemId,
      data,
      color,
      name: String(getFieldValue(item, "name") ?? itemId),
      nativeName: "",
      family: "",
      totalSpeakers: 0,
      pluginId,
      opacity: 0.5,
      dataType: plugin.dataType,
    });
  }, [fetchGeoJson]);

  const handleHoverItemEnd = useCallback(() => {
    setPreviewOverlay(null);
  }, []);

  // Build overlay list for MapView from all active items
  const overlays: LanguageOverlay[] = useMemo(() => {
    const result: LanguageOverlay[] = [];
    for (const plugin of plugins) {
      const registry = pluginDataRegistries[plugin.id];
      if (!registry) continue;
      const pluginActiveItems = activeItems[plugin.id];
      if (!pluginActiveItems || pluginActiveItems.size === 0) continue;

      const idField = plugin.sidebarConfig?.idField ?? "code";
      const groupBy = plugin.sidebarConfig?.groupBy;

      const groupNames = groupBy
        ? [
            ...new Set(
              registry.map((item) =>
                String(getFieldValue(item, groupBy) ?? "Other")
              )
            ),
          ]
        : [];
      const palette = getPluginPalette(plugin.id);
      const colorMap = groupBy
        ? buildGroupColorMap(groupNames, palette)
        : {};

      for (const itemId of pluginActiveItems) {
        if (!geoJsonCache[itemId]) continue;
        const item = registry.find(
          (it) => String(getFieldValue(it, idField)) === itemId
        );
        if (!item) continue;

        const groupKey = groupBy
          ? String(getFieldValue(item, groupBy) ?? "Other")
          : "";
        const color =
          colorMap[groupKey] ?? plugin.defaultColor ?? palette[0] ?? "#888888";

        result.push({
          code: itemId,
          data: geoJsonCache[itemId],
          color,
          name: String(getFieldValue(item, "name") ?? itemId),
          nativeName: String(getFieldValue(item, "nativeName") ?? ""),
          family: String(getFieldValue(item, groupBy ?? "") ?? ""),
          totalSpeakers: Number(
            getFieldValue(item, "speakers.total") ?? 0
          ),
          pluginId: plugin.id,
          opacity: overlayOpacity[itemId] ?? 1,
          dataType: plugin.dataType,
        });
      }
    }
    return result;
  }, [activeItems, geoJsonCache, overlayOpacity]);

  // Build sidebar panels for plugins that have sidebarConfig and data
  const sidebarPanels: PluginPanel[] = useMemo(() => {
    return plugins
      .filter((p) => p.sidebarConfig && pluginDataRegistries[p.id])
      .map((p) => ({
        pluginId: p.id,
        pluginName: p.name,
        category: p.category ?? "Other",
        config: p.sidebarConfig!,
        items: pluginDataRegistries[p.id],
        activeItems: activeItems[p.id] ?? new Set(),
      }));
  }, [activeItems]);

  // Flatten toggle for OverlayLegend
  const handleToggleOverlay = useCallback(
    (code: string) => {
      for (const plugin of plugins) {
        const registry = pluginDataRegistries[plugin.id];
        if (!registry) continue;
        const idField = plugin.sidebarConfig?.idField ?? "code";
        const found = registry.find(
          (item) => String(getFieldValue(item, idField)) === code
        );
        if (found) {
          handleToggleItem(plugin.id, code);
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleClickOverlay = useCallback(
    (code: string) => {
      for (const plugin of plugins) {
        const registry = pluginDataRegistries[plugin.id];
        if (!registry) continue;
        const idField = plugin.sidebarConfig?.idField ?? "code";
        const found = registry.find(
          (item) => String(getFieldValue(item, idField)) === code
        );
        if (found) {
          handleSelectItem(plugin.id, code);
          return;
        }
      }
    },
    [handleSelectItem]
  );

  const selectedPlugin = selectedItem
    ? plugins.find((p) => p.id === selectedItem.pluginId)
    : null;

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Map header with back button */}
      <header
        className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 z-[1002] shrink-0"
        data-testid="map-header"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          data-testid="back-button"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          <span className="text-sm font-medium">OmniMap</span>
        </Link>
      </header>
      <div className="flex-1 relative overflow-hidden">
        <GenericSidebar
          panels={sidebarPanels}
          activePluginId={activePluginTab}
          onChangeActivePlugin={setActivePluginTab}
          onToggleItem={(pluginId, itemId) =>
            handleToggleItem(pluginId, itemId)
          }
          onSelectItem={handleSelectItem}
          onHoverItem={handleHoverItem}
          onHoverItemEnd={handleHoverItemEnd}
        />
        <MapView
          overlays={previewOverlay ? [...overlays, previewOverlay] : overlays}
          onClickOverlay={handleClickOverlay}
        />
        <OverlayLegend
          overlays={overlays}
          onToggleLanguage={handleToggleOverlay}
          onChangeOpacity={handleChangeOpacity}
        />
        {selectedItem && selectedPlugin && (
          <GenericDetailPanel
            item={selectedItem.item}
            allItems={pluginDataRegistries[selectedItem.pluginId] ?? []}
            detailFields={selectedPlugin.detailFields ?? []}
            detailPanelConfig={
              selectedPlugin.detailPanelConfig ?? { titleField: "name" }
            }
            sidebarConfig={selectedPlugin.sidebarConfig}
            onClose={handleCloseDetail}
            onSelectItem={(id) =>
              handleSelectItem(selectedItem.pluginId, id)
            }
          />
        )}
      </div>
    </main>
  );
}
