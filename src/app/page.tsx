"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";
import type { LanguageMetadata } from "@/lib/plugins/language-types";
import { getFamilyColor } from "@/lib/language-utils";
import LanguageSidebar from "@/components/LanguageSidebar";
import LanguageDetailPanel from "@/components/LanguageDetailPanel";
import OverlayLegend from "@/components/OverlayLegend";
import type { LanguageOverlay } from "@/components/MapView";
import languageRegistry from "@/generated/language-registry.json";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const languages = languageRegistry as unknown as LanguageMetadata[];

export default function Home() {
  const [activeLanguages, setActiveLanguages] = useState<Set<string>>(
    new Set()
  );
  const [geoJsonCache, setGeoJsonCache] = useState<
    Record<string, FeatureCollection>
  >({});
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageMetadata | null>(null);

  const handleToggleLanguage = async (code: string) => {
    setActiveLanguages((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });

    if (!geoJsonCache[code]) {
      try {
        const response = await fetch(`/geo/${code}.geojson`);
        if (response.ok) {
          const data = await response.json();
          setGeoJsonCache((prev) => ({ ...prev, [code]: data }));
        }
      } catch {
        // GeoJSON load failed silently
      }
    }
  };

  const handleSelectLanguage = useCallback((code: string) => {
    const lang = languages.find((l) => l.code === code);
    if (lang) setSelectedLanguage(lang);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedLanguage(null);
  }, []);

  const overlays: LanguageOverlay[] = Array.from(activeLanguages)
    .filter((code) => geoJsonCache[code])
    .map((code) => {
      const lang = languages.find((l) => l.code === code);
      return {
        code,
        data: geoJsonCache[code],
        color: getFamilyColor(lang?.family ?? ""),
        name: lang?.name,
        nativeName: lang?.nativeName,
        family: lang?.family,
        totalSpeakers: lang?.speakers.total,
      };
    });

  return (
    <main className="h-screen w-screen">
      <LanguageSidebar
        languages={languages}
        activeLanguages={activeLanguages}
        onToggleLanguage={handleToggleLanguage}
        onSelectLanguage={handleSelectLanguage}
      />
      <MapView overlays={overlays} onClickOverlay={handleSelectLanguage} />
      <OverlayLegend
        overlays={overlays}
        onToggleLanguage={handleToggleLanguage}
      />
      {selectedLanguage && (
        <LanguageDetailPanel
          language={selectedLanguage}
          allLanguages={languages}
          onClose={handleCloseDetail}
          onSelectLanguage={handleSelectLanguage}
        />
      )}
    </main>
  );
}
