"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet.markercluster";
import { formatSpeakers } from "@/lib/language-utils";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

const DARK_TILES_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface LanguageOverlay {
  code: string;
  data: FeatureCollection;
  color: string;
  name?: string;
  nativeName?: string;
  family?: string;
  totalSpeakers?: number;
  pluginId?: string;
  opacity?: number;
  dataType?: "regions" | "points" | "lines" | "heatmap";
}

export interface TooltipData {
  name: string;
  nativeName: string;
  family: string;
  totalSpeakers: number;
  x: number;
  y: number;
}

interface MapViewProps {
  overlays?: LanguageOverlay[];
  onClickOverlay?: (code: string) => void;
}

const FADE_DURATION_MS = 400;
const LONG_PRESS_MS = 500;

interface GlowOverlayProps extends LanguageOverlay {
  onHover: (data: TooltipData | null) => void;
  onMove: (x: number, y: number) => void;
  onClick?: (code: string) => void;
  paneName?: string;
}

function GlowOverlay({
  code,
  data,
  color,
  name,
  nativeName,
  family,
  totalSpeakers,
  opacity = 1,
  onHover,
  onMove,
  onClick,
  paneName,
}: GlowOverlayProps) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const layer = L.geoJSON(data, {
      ...(paneName ? { pane: paneName } : {}),
      pointToLayer: (feature, latlng) => {
        const props = feature?.properties ?? {};
        const pax = Number(props.annualPassengers ?? 0);
        let radius = 5;
        if (pax >= 70_000_000) radius = 10;
        else if (pax >= 50_000_000) radius = 8;
        else if (pax >= 40_000_000) radius = 6;
        else if (pax > 0) radius = 5;

        const marker = L.circleMarker(latlng, {
          radius,
          fillColor: color,
          fillOpacity: 0.8,
          color: "#fff",
          weight: 1,
          opacity: 0.6,
          className: `language-overlay overlay-${code}`,
        });

        if (props.iataCode) {
          marker.bindTooltip(String(props.iataCode), {
            permanent: true,
            direction: "top",
            offset: [0, -radius],
            className: "iata-label",
          });
        }

        return marker;
      },
      style: (feature) => {
        const geomType = feature?.geometry?.type;
        const isLine =
          geomType === "LineString" || geomType === "MultiLineString";

        if (isLine) {
          const props = feature?.properties ?? {};
          const weeklyFlights = Number(props.weeklyFlights ?? 0);
          const boundaryType = props.boundaryType as string | undefined;
          const routeType = props.routeType as string | undefined;

          // Route-specific styling: vary weight and opacity by flight frequency
          if (weeklyFlights > 0) {
            let weight = 1.5;
            let lineOpacity = 0.5;
            if (weeklyFlights >= 200) { weight = 4; lineOpacity = 0.9; }
            else if (weeklyFlights >= 100) { weight = 3; lineOpacity = 0.75; }
            else if (weeklyFlights >= 50) { weight = 2; lineOpacity = 0.6; }
            return {
              color,
              weight,
              opacity: lineOpacity,
              dashArray: "",
              fillOpacity: 0,
              className: `language-overlay overlay-${code}`,
            };
          }

          // Migration corridor styling: weight by migrant volume, dashed line
          const migrantVolume = Number(props.migrantVolume ?? 0);
          if (migrantVolume > 0) {
            let weight = 2;
            if (migrantVolume >= 5) weight = 4.5;
            else if (migrantVolume >= 4) weight = 3.5;
            else if (migrantVolume >= 3) weight = 2.5;
            return {
              color,
              weight,
              opacity: 0.8,
              dashArray: "6 4",
              fillOpacity: 0,
              className: `language-overlay overlay-${code}`,
            };
          }

          // Ocean current styling: weight by strength, solid line
          const currentStrength = Number(props.currentStrength ?? 0);
          if (currentStrength > 0) {
            let weight = 2;
            if (currentStrength >= 5) weight = 4;
            else if (currentStrength >= 4) weight = 3.5;
            else if (currentStrength >= 3) weight = 3;
            else if (currentStrength >= 2) weight = 2.5;
            return {
              color,
              weight,
              opacity: 0.85,
              dashArray: "",
              fillOpacity: 0,
              className: `language-overlay overlay-${code}`,
            };
          }

          // Historical trade route styling: distinct dashes per route type
          if (routeType) {
            const isLand = routeType === "land";
            const isMaritime = routeType === "maritime";
            return {
              color,
              weight: isLand ? 2.5 : 2,
              opacity: isLand ? 0.85 : 0.75,
              dashArray: isLand ? "10 5" : isMaritime ? "3 6" : "10 3 3 3",
              fillOpacity: 0,
              className: `language-overlay overlay-${code}`,
            };
          }

          return {
            color,
            weight: boundaryType === "convergent" ? 3 : 2,
            opacity: 0.9,
            dashArray:
              boundaryType === "divergent"
                ? "8 4"
                : boundaryType === "convergent"
                  ? ""
                  : "4 4",
            fillOpacity: 0,
            className: `language-overlay overlay-${code}`,
          };
        }

        // Arrow indicator polygons for directional overlays (e.g., ocean currents)
        const featureType = feature?.properties?.featureType as string | undefined;
        if (featureType === "arrow") {
          return {
            fillColor: color,
            fillOpacity: 0.7,
            color,
            weight: 1,
            opacity: 0.9,
            className: `language-overlay overlay-${code}`,
          };
        }

        return {
          fillColor: color,
          fillOpacity: 0.3,
          color,
          weight: 2,
          opacity: 0.8,
          className: `language-overlay overlay-${code}`,
        };
      },
    });

    layer.on("mouseover", (e: L.LeafletMouseEvent) => {
      if (name && nativeName && family && totalSpeakers != null) {
        const point = map.latLngToContainerPoint(e.latlng);
        onHover({
          name,
          nativeName,
          family,
          totalSpeakers,
          x: point.x,
          y: point.y,
        });
      }
    });

    layer.on("mousemove", (e: L.LeafletMouseEvent) => {
      const point = map.latLngToContainerPoint(e.latlng);
      onMove(point.x, point.y);
    });

    layer.on("mouseout", () => {
      onHover(null);
    });

    layer.on("click", () => {
      onClick?.(code);
    });

    // Mobile: contextmenu fires on long-press in most mobile browsers
    layer.on("contextmenu", (e: L.LeafletMouseEvent) => {
      if (name && nativeName && family && totalSpeakers != null) {
        const point = map.latLngToContainerPoint(e.latlng);
        onHover({
          name,
          nativeName,
          family,
          totalSpeakers,
          x: point.x,
          y: point.y,
        });
      }
    });

    // Fallback long-press via touch events
    const container = map.getContainer();
    const handleTouchStart = (e: TouchEvent) => {
      if (!name || !nativeName || !family || totalSpeakers == null) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const latlng = map.containerPointToLatLng(L.point(x, y));

      // Check if the touch point is within this layer's bounds
      let isInLayer = false;
      layer.eachLayer((l) => {
        if ((l as L.Polygon).getBounds?.()?.contains(latlng)) {
          isInLayer = true;
        }
      });

      if (isInLayer) {
        longPressTimer.current = setTimeout(() => {
          onHover({ name, nativeName, family, totalSpeakers, x, y });
        }, LONG_PRESS_MS);
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      onHover(null);
    };

    const handleTouchMove = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchmove", handleTouchMove);

    layer.addTo(map);
    layerRef.current = layer;

    // Toggle IATA label tooltips based on zoom level
    const tooltipLayers: L.CircleMarker[] = [];
    layer.eachLayer((l) => {
      if ((l as L.CircleMarker).getTooltip?.()) {
        tooltipLayers.push(l as L.CircleMarker);
      }
    });
    const updateIataLabels = () => {
      const zoom = map.getZoom();
      for (const l of tooltipLayers) {
        if (zoom >= 5) { l.openTooltip(); } else { l.closeTooltip(); }
      }
    };
    if (tooltipLayers.length > 0) {
      map.on("zoomend", updateIataLabels);
      updateIataLabels();
    }

    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (tooltipLayers.length > 0) {
        map.off("zoomend", updateIataLabels);
      }
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchmove", handleTouchMove);

      // Fade out each path before removing the layer
      layer.eachLayer((l) => {
        const pathEl = (l as L.Path & { _path?: SVGPathElement })._path;
        if (pathEl) {
          pathEl.style.opacity = "0";
        }
      });

      setTimeout(() => {
        try {
          if (map.hasLayer(layer)) {
            map.removeLayer(layer);
          }
        } catch {
          // Map may already be destroyed during full unmount
        }
      }, FADE_DURATION_MS);
    };
  }, [map, data, color, code, name, nativeName, family, totalSpeakers, onHover, onMove, onClick, paneName]);

  // Separate effect for opacity updates (avoids recreating the layer)
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setStyle({
        fillOpacity: 0.3 * opacity,
        opacity: 0.8 * opacity,
      });
    }
  }, [opacity]);

  return null;
}

/** Renders a group of point overlays as clustered circle markers */
function PointClusterOverlay({
  overlays,
  pluginId,
  onHover,
  onMove,
  onClick,
}: {
  overlays: LanguageOverlay[];
  pluginId: string;
  onHover: (data: TooltipData | null) => void;
  onMove: (x: number, y: number) => void;
  onClick?: (code: string) => void;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const clsPrefix = `point-cluster-${pluginId}`;
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        const size = count >= 100 ? "large" : count >= 10 ? "medium" : "small";
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `${clsPrefix} ${clsPrefix}-${size}`,
          iconSize: L.point(40, 40),
        });
      },
    });

    for (const overlay of overlays) {
      for (const feature of overlay.data.features) {
        if (feature.geometry.type !== "Point") continue;
        const coords = feature.geometry.coordinates as [number, number];
        const props = feature.properties ?? {};

        // Determine marker radius based on plugin type
        const pluginId = overlay.pluginId ?? "default";
        let radius = 6;
        if (pluginId === "volcanoes") {
          const vei = Number(props.vei ?? 0);
          radius = vei >= 6 ? 10 : vei >= 4 ? 8 : vei >= 2 ? 6 : 4;
        }

        const marker = L.circleMarker([coords[1], coords[0]], {
          radius,
          fillColor: overlay.color,
          fillOpacity: 0.8 * (overlay.opacity ?? 1),
          color: "#fff",
          weight: 1,
          opacity: 0.6 * (overlay.opacity ?? 1),
        });

        marker.on("mouseover", (e: L.LeafletMouseEvent) => {
          const point = map.latLngToContainerPoint(e.latlng);
          // Build tooltip data based on available properties
          let nativeName = "";
          let family = "";
          if (pluginId === "volcanoes") {
            nativeName = String(props.volcanoType ?? "");
            family = `${props.elevation ?? ""}m · ${props.status ?? overlay.family ?? ""}`;
          } else if (pluginId === "unesco-sites") {
            nativeName = String(props.type ?? "");
            family = String(props.country ?? "");
          } else {
            nativeName = String(props.type ?? "");
            family = String(overlay.family ?? "");
          }
          onHover({
            name: String(props.name ?? overlay.name ?? overlay.code),
            nativeName,
            family,
            totalSpeakers: 0,
            x: point.x,
            y: point.y,
          });
        });

        marker.on("mousemove", (e: L.LeafletMouseEvent) => {
          const point = map.latLngToContainerPoint(e.latlng);
          onMove(point.x, point.y);
        });

        marker.on("mouseout", () => onHover(null));
        marker.on("click", () => onClick?.(overlay.code));

        cluster.addLayer(marker);
      }
    }

    cluster.addTo(map);
    clusterRef.current = cluster;

    return () => {
      try {
        if (map.hasLayer(cluster)) {
          map.removeLayer(cluster);
        }
      } catch {
        // Map may already be destroyed during full unmount
      }
    };
  }, [map, overlays, pluginId, onHover, onMove, onClick]);

  return null;
}

// Shared base CSS for point cluster markers + per-plugin colors
const CLUSTER_CSS = `
[class*="point-cluster-"] {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
[class*="point-cluster-"] div {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
[class*="point-cluster-"] span {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
[class*="point-cluster-"][class*="-large"] div {
  width: 36px;
  height: 36px;
}
[class*="point-cluster-"][class*="-large"] span {
  font-size: 14px;
}
/* IATA code labels for airport markers */
.iata-label {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6);
  padding: 0 !important;
}
.iata-label::before {
  display: none !important;
}
/* Volcano clusters: red → orange → yellow */
.point-cluster-volcanoes { background: rgba(239, 68, 68, 0.4); }
.point-cluster-volcanoes div { background: rgba(239, 68, 68, 0.7); }
.point-cluster-volcanoes-medium { background: rgba(249, 115, 22, 0.4); }
.point-cluster-volcanoes-medium div { background: rgba(249, 115, 22, 0.7); }
.point-cluster-volcanoes-large { background: rgba(234, 179, 8, 0.4); }
.point-cluster-volcanoes-large div { background: rgba(234, 179, 8, 0.7); }
/* UNESCO clusters: blue → indigo → violet */
.point-cluster-unesco-sites { background: rgba(59, 130, 246, 0.4); }
.point-cluster-unesco-sites div { background: rgba(59, 130, 246, 0.7); }
.point-cluster-unesco-sites-medium { background: rgba(99, 102, 241, 0.4); }
.point-cluster-unesco-sites-medium div { background: rgba(99, 102, 241, 0.7); }
.point-cluster-unesco-sites-large { background: rgba(139, 92, 246, 0.4); }
.point-cluster-unesco-sites-large div { background: rgba(139, 92, 246, 0.7); }
`;

// Base z-index for plugin overlay panes (above tiles at 400, below controls at 1000)
const PLUGIN_PANE_BASE_Z = 450;

function PluginPane({
  pluginId,
  zIndex,
}: {
  pluginId: string;
  zIndex: number;
}) {
  const map = useMap();
  useEffect(() => {
    const paneName = `plugin-${pluginId}`;
    if (!map.getPane(paneName)) {
      const pane = map.createPane(paneName);
      pane.style.zIndex = String(zIndex);
    }
  }, [map, pluginId, zIndex]);
  return null;
}

function generateGlowCSS(overlays: LanguageOverlay[]): string {
  return overlays
    .map(
      (o) =>
        `.overlay-${o.code} { filter: drop-shadow(0 0 4px ${o.color}80) drop-shadow(0 0 8px ${o.color}40); }`
    )
    .join("\n");
}

function LanguageTooltip({ tooltip }: { tooltip: TooltipData }) {
  return (
    <div
      data-testid="language-tooltip"
      role="tooltip"
      style={{
        position: "absolute",
        left: tooltip.x + 12,
        top: tooltip.y - 12,
        zIndex: 1000,
        pointerEvents: "none",
      }}
      className="rounded-lg bg-gray-900/95 px-3 py-2 text-sm text-white shadow-lg backdrop-blur-sm border border-white/10"
    >
      <div className="font-semibold" data-testid="tooltip-name">
        {tooltip.name}
      </div>
      {tooltip.nativeName !== tooltip.name && (
        <div className="text-gray-300 italic" data-testid="tooltip-native-name">
          {tooltip.nativeName}
        </div>
      )}
      {tooltip.totalSpeakers > 0 && (
        <div className="mt-1 text-gray-400 text-xs" data-testid="tooltip-speakers">
          {formatSpeakers(tooltip.totalSpeakers)} speakers
        </div>
      )}
      <div className="text-gray-400 text-xs" data-testid="tooltip-family">
        {tooltip.family}
      </div>
    </div>
  );
}

export default function MapView({ overlays = [], onClickOverlay }: MapViewProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const handleHover = useCallback((data: TooltipData | null) => {
    setTooltip(data);
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    setTooltip((prev) => (prev ? { ...prev, x, y } : null));
  }, []);

  // Derive unique plugin IDs for pane creation, preserving order
  const pluginIds = Array.from(
    new Set(overlays.map((o) => o.pluginId ?? "default"))
  );

  // Separate point overlays from region/line overlays
  const regionOverlays = overlays.filter((o) => o.dataType !== "points");
  const pointOverlays = overlays.filter((o) => o.dataType === "points");

  // Group point overlays by plugin for efficient clustering
  const pointOverlaysByPlugin = new Map<string, LanguageOverlay[]>();
  for (const o of pointOverlays) {
    const key = o.pluginId ?? "default";
    if (!pointOverlaysByPlugin.has(key)) {
      pointOverlaysByPlugin.set(key, []);
    }
    pointOverlaysByPlugin.get(key)!.push(o);
  }

  return (
    <>
      <style
        data-testid="overlay-glow-styles"
        dangerouslySetInnerHTML={{ __html: generateGlowCSS(overlays) + CLUSTER_CSS }}
      />
      <div className="relative h-full w-full">
        <MapContainer
          center={[20, 0]}
          zoom={3}
          className="h-full w-full"
          zoomControl={false}
          scrollWheelZoom={true}
          data-testid="map-container"
        >
          <ZoomControl position="bottomright" />
          <TileLayer url={DARK_TILES_URL} attribution={ATTRIBUTION} />
          {pluginIds.map((pluginId, index) => (
            <PluginPane
              key={pluginId}
              pluginId={pluginId}
              zIndex={PLUGIN_PANE_BASE_Z + index}
            />
          ))}
          {regionOverlays.map((overlay) => (
            <GlowOverlay
              key={overlay.code}
              {...overlay}
              paneName={`plugin-${overlay.pluginId ?? "default"}`}
              onHover={handleHover}
              onMove={handleMove}
              onClick={onClickOverlay}
            />
          ))}
          {[...pointOverlaysByPlugin.entries()].map(([pluginId, pluginOverlays]) => (
            <PointClusterOverlay
              key={`point-cluster-${pluginId}`}
              overlays={pluginOverlays}
              pluginId={pluginId}
              onHover={handleHover}
              onMove={handleMove}
              onClick={onClickOverlay}
            />
          ))}
        </MapContainer>
        {tooltip && <LanguageTooltip tooltip={tooltip} />}
      </div>
    </>
  );
}
