"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PluginMetadata } from "@/lib/plugins/types";
import pluginRegistry from "@/generated/plugin-registry.json";

const plugins = pluginRegistry as unknown as PluginMetadata[];

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
    router.push(`/map?plugin=${plugin.id}`);
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

      {/* Plugin list */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {sortedCategories.length === 0 ? (
          <p
            className="text-center text-gray-500 py-12"
            data-testid="no-results"
          >
            No overlays found
          </p>
        ) : (
          sortedCategories.map((category) => (
            <section key={category} className="mb-6" data-testid={`category-grid-${category}`}>
              <h2
                className="text-xs font-semibold text-gray-500 mb-1 px-3 uppercase tracking-wider"
                data-testid={`category-header-${category}`}
              >
                {capitalize(category)}
              </h2>
              <div className="rounded-lg overflow-hidden border border-gray-800">
                {grouped[category].map((plugin, i) => (
                  <button
                    key={plugin.id}
                    onClick={() => handleCardClick(plugin)}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:bg-gray-800 ${
                      i > 0 ? "border-t border-gray-800/50" : ""
                    }`}
                    data-testid={`overlay-card-${plugin.id}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: plugin.defaultColor }}
                    />
                    <span className="text-sm font-medium text-gray-100 group-hover:text-blue-400 transition-colors flex-shrink-0">
                      {plugin.name}
                    </span>
                    <span
                      className="text-sm text-gray-500 truncate min-w-0"
                      data-testid={`card-description-${plugin.id}`}
                    >
                      {plugin.description}
                    </span>
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
