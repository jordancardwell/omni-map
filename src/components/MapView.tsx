"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import { formatSpeakers } from "@/lib/language-utils";
import "leaflet/dist/leaflet.css";

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
}

function GlowOverlay({
  code,
  data,
  color,
  name,
  nativeName,
  family,
  totalSpeakers,
  onHover,
  onMove,
  onClick,
}: GlowOverlayProps) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const layer = L.geoJSON(data, {
      style: () => ({
        fillColor: color,
        fillOpacity: 0.3,
        color: color,
        weight: 2,
        opacity: 0.8,
        className: `language-overlay overlay-${code}`,
      }),
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

    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
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
  }, [map, data, color, code, name, nativeName, family, totalSpeakers, onHover, onMove, onClick]);

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
      <div className="mt-1 text-gray-400 text-xs" data-testid="tooltip-speakers">
        {formatSpeakers(tooltip.totalSpeakers)} speakers
      </div>
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

  return (
    <>
      <style
        data-testid="overlay-glow-styles"
        dangerouslySetInnerHTML={{ __html: generateGlowCSS(overlays) }}
      />
      <div className="relative h-full w-full">
        <MapContainer
          center={[20, 0]}
          zoom={3}
          className="h-full w-full"
          zoomControl={true}
          scrollWheelZoom={true}
          data-testid="map-container"
        >
          <TileLayer url={DARK_TILES_URL} attribution={ATTRIBUTION} />
          {overlays.map((overlay) => (
            <GlowOverlay
              key={overlay.code}
              {...overlay}
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
