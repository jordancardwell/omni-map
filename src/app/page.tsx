"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PluginMetadata } from "@/lib/plugins/types";
import pluginRegistry from "@/generated/plugin-registry.json";

const plugins = pluginRegistry as unknown as PluginMetadata[];

const ICON_MAP: Record<string, string> = {
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  map: "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z",
  layers: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z",
  chart: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
};

function PluginIcon({ icon, color }: { icon: string; color: string }) {
  const path = ICON_MAP[icon] || ICON_MAP.globe;
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8"
      fill={color}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set()
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query at 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Get all unique categories
  const allCategories = Array.from(
    new Set(plugins.map((p) => p.category))
  ).sort();

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Filter plugins
  const filtered = plugins.filter((plugin) => {
    const query = debouncedQuery.toLowerCase();
    const matchesSearch =
      !query ||
      plugin.name.toLowerCase().includes(query) ||
      plugin.description.toLowerCase().includes(query);
    const matchesCategory =
      activeCategories.size === 0 || activeCategories.has(plugin.category);
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, PluginMetadata[]>>(
    (acc, plugin) => {
      const cat = plugin.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(plugin);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.keys(grouped).sort();

  const handleCardClick = (plugin: PluginMetadata) => {
    router.push(`/map?overlay=${plugin.id}`);
  };

  return (
    <main
      className="min-h-screen bg-gray-900 text-gray-100"
      data-testid="landing-page"
    >
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="landing-title">
            OmniMap
          </h1>
          <p className="mt-1 text-gray-400">
            Explore interactive map overlays
          </p>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search overlays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="overlay-search"
            />
          </div>

          {/* Category filter chips */}
          {allCategories.length > 0 && (
            <div
              className="mt-3 flex flex-wrap gap-2"
              data-testid="category-filters"
            >
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeCategories.has(category)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  data-testid={`category-chip-${category}`}
                >
                  {capitalize(category)}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Card grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedCategories.length === 0 ? (
          <p
            className="text-center text-gray-500 py-12"
            data-testid="no-results"
          >
            No overlays found
          </p>
        ) : (
          sortedCategories.map((category) => (
            <section key={category} className="mb-10">
              <h2
                className="text-lg font-semibold text-gray-300 mb-4 uppercase tracking-wider"
                data-testid={`category-header-${category}`}
              >
                {capitalize(category)}
              </h2>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                data-testid={`category-grid-${category}`}
              >
                {grouped[category].map((plugin) => (
                  <button
                    key={plugin.id}
                    onClick={() => handleCardClick(plugin)}
                    className="group bg-gray-800 border border-gray-700 rounded-xl p-5 text-left hover:border-blue-500 hover:bg-gray-750 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid={`overlay-card-${plugin.id}`}
                  >
                    {/* Thumbnail / color preview */}
                    <div
                      className="w-full h-24 rounded-lg mb-4 flex items-center justify-center"
                      style={{
                        backgroundColor: plugin.thumbnail.startsWith("#")
                          ? plugin.thumbnail
                          : undefined,
                      }}
                      data-testid={`card-thumbnail-${plugin.id}`}
                    >
                      <PluginIcon
                        icon={plugin.icon}
                        color={
                          plugin.thumbnail.startsWith("#")
                            ? "rgba(255,255,255,0.8)"
                            : plugin.defaultColor
                        }
                      />
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                        {plugin.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p
                      className="text-sm text-gray-400 mb-3 line-clamp-2"
                      data-testid={`card-description-${plugin.id}`}
                    >
                      {plugin.description}
                    </p>

                    {/* Category tags */}
                    <div className="flex flex-wrap gap-1">
                      {plugin.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300"
                          data-testid={`card-tag-${plugin.id}-${cat}`}
                        >
                          {capitalize(cat)}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
