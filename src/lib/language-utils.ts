export const FAMILY_COLORS: Record<string, string> = {
  "Indo-European": "#4A90D9",
  "Sino-Tibetan": "#E74C3C",
  "Afro-Asiatic": "#F39C12",
  "Austronesian": "#27AE60",
  "Turkic": "#9B59B6",
  "Dravidian": "#F1C40F",
  "Niger-Congo": "#1ABC9C",
  "Koreanic": "#E91E63",
  "Uralic": "#00BCD4",
  "Kra-Dai": "#8BC34A",
  "Japonic": "#FF5722",
  "Austroasiatic": "#FF9800",
  "Kartvelian": "#3F51B5",
};

export function getFamilyColor(family: string): string {
  return FAMILY_COLORS[family] ?? "#888888";
}

// Distinct color palettes for different plugin types.
// Each plugin uses a separate palette to avoid visual confusion
// when multiple overlays from different plugins are active.
export const PLUGIN_PALETTES: Record<string, string[]> = {
  languages: [
    "#4A90D9", "#E74C3C", "#F39C12", "#27AE60", "#9B59B6",
    "#F1C40F", "#1ABC9C", "#E91E63", "#00BCD4", "#8BC34A",
    "#FF5722", "#FF9800", "#3F51B5",
  ],
  // Distinct tones for world religions overlay
  religions: [
    "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#3B82F6", "#14B8A6", "#A855F7", "#6B7280",
  ],
  // Warm tones for geological/terrain overlays
  geology: [
    "#D4A574", "#C68642", "#8B6914", "#A0522D", "#CD853F",
    "#DEB887", "#F5DEB3", "#D2691E", "#B8860B", "#DAA520",
  ],
  // Cool blues/greens for climate/environmental overlays
  climate: [
    "#1A5276", "#2E86C1", "#5DADE2", "#85C1E9", "#AED6F1",
    "#0E6655", "#1ABC9C", "#48C9B0", "#76D7C4", "#A3E4D7",
  ],
  // Jewel tones for writing systems overlay
  "writing-systems": [
    "#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626",
    "#0891B2",
  ],
  // Currency tones: greens, golds, and rich hues for monetary systems
  currencies: [
    "#16A34A", "#CA8A04", "#0D9488", "#7C3AED", "#DC2626",
    "#2563EB", "#EA580C", "#DB2777",
  ],
  // Power grid tones: warm (110V), cool (220V), amber (dual-voltage)
  "power-grids": [
    "#EF4444", "#F97316", "#3B82F6", "#06B6D4", "#F59E0B",
    "#8B5CF6", "#10B981", "#EC4899",
  ],
  // Internet speed gradient: green (fast) to red (slow) for speed tiers
  "internet-speed": [
    "#10B981", "#34D399", "#84CC16", "#EAB308", "#EF4444",
  ],
  // Earthy/herbal tones for traditional medicine systems
  "traditional-medicine": [
    "#059669", "#7C3AED", "#D97706", "#DC2626", "#2563EB",
    "#0891B2", "#CA8A04", "#9333EA", "#16A34A", "#DB2777",
  ],
  // Geological tones for tectonic plates: warm earths for major, cool blues for minor, gray for microplates
  "tectonic-plates": [
    "#DC2626", "#2563EB", "#10B981", "#F59E0B", "#8B5CF6",
    "#EC4899", "#06B6D4", "#EA580C", "#14B8A6", "#D946EF",
    "#84CC16", "#F97316", "#6366F1", "#0EA5E9", "#A855F7",
  ],
  // Standard Köppen-Geiger colors for 30 climate classes: A=blues, B=reds/oranges, C=greens/yellows, D=purples/cyans, E=grays
  "climate-zones": [
    "#0000FF", "#0078FF", "#46AAFA",
    "#FF0000", "#FF9696", "#F5A500", "#FFDC64",
    "#FFFF00", "#C8C800", "#969600", "#96FF96", "#63C764", "#329633", "#C8FF50", "#64FF50", "#32C800",
    "#FF00FF", "#C800C8", "#963296", "#640064", "#AAAFFF", "#5A78DC", "#4B50B4", "#320087",
    "#00FFFF", "#37C8FF", "#007D7D", "#00465F",
    "#B2B2B2", "#686868",
  ],
  // Warm-to-critical colors for biodiversity hotspots: greens (vulnerable), oranges (endangered), reds (critical)
  "biodiversity-hotspots": [
    "#E63946", "#D62828", "#F77F00", "#FCBF49", "#2A9D8F",
    "#264653", "#E76F51", "#F4A261", "#6A994E", "#BC4749",
    "#A7C957", "#386641", "#D4A373", "#CB997E", "#FFCB77",
    "#FE6D73",
  ],
  // Time zone gradient: cool-to-warm from UTC-12 (deep blue) to UTC+14 (deep red)
  "time-zones": [
    "#1E3A8A", "#2563EB", "#0891B2", "#16A34A", "#84CC16",
    "#EAB308", "#EA580C", "#DC2626",
  ],
  // WWF biome colors: forests=greens, grasslands=golds/tans, tundra=light gray, desert=sand, mediterranean=olive, mangroves=teal, coastal=blue-green
  biomes: [
    "#1B7A3D", "#6B8E23", "#228B22", "#3CB371", "#2F6B4F",
    "#1A5653", "#DAA520", "#D2B48C", "#20B2AA", "#8B6C5C",
    "#C0C8D0", "#CD853F", "#EDC9AF", "#2E8B57",
  ],
  // Volcanic activity colors: red (erupting/recent), orange (historically active), yellow (dormant)
  volcanoes: [
    "#EF4444", "#F97316", "#EAB308",
  ],
  // UNESCO World Heritage Sites: blue (cultural), green (natural), purple (mixed)
  "unesco-sites": [
    "#3B82F6", "#22C55E", "#A855F7",
  ],
  // Space launch sites: green (active), gray (historical/decommissioned), blue (planned)
  "space-launch-sites": [
    "#22C55E", "#9CA3AF", "#3B82F6",
  ],
  // Astronomical observatories: blue (optical), orange (radio), purple (multi-messenger), gray (space-based)
  observatories: [
    "#3B82F6", "#F97316", "#8B5CF6", "#9CA3AF",
  ],
  // Earthy/warm tones for indigenous territories: ochres, terracotta, turquoise, sage to reflect cultural connection to land
  "indigenous-territories": [
    "#D97706", "#B45309", "#92400E", "#78350F",
    "#DC2626", "#B91C1C", "#991B1B",
    "#059669", "#047857", "#065F46",
    "#7C3AED", "#6D28D9", "#5B21B6",
    "#0891B2", "#0E7490", "#155E75",
    "#CA8A04", "#A16207", "#854D0E",
    "#E11D48", "#BE123C", "#9F1239",
    "#2563EB", "#1D4ED8", "#1E40AF",
  ],
  // Submarine cables: purple (ultra-high >100Tbps), blue (high 20-100), cyan (medium 5-20), gray (standard <5)
  "submarine-cables": [
    "#7C3AED", "#2563EB", "#0891B2", "#6B7280",
  ],
  // Shipping routes: red (major lanes), amber (middle lanes), gray (minor lanes), blue (container port), green (bulk port), orange (oil/gas), purple (multi-purpose)
  "shipping-routes": [
    "#DC2626", "#F59E0B", "#6B7280", "#2563EB", "#059669", "#D97706", "#7C3AED",
  ],
  // Air routes: red (mega hub / ultra high freq), amber (major hub / high freq), blue (international hub / medium freq), green (regional hub / standard freq)
  "air-routes": [
    "#DC2626", "#F59E0B", "#3B82F6", "#10B981",
  ],
  // Historical trade routes: amber/ochre (land), teal/cyan (maritime), purple (mixed), grouped by era
  "trade-routes": [
    "#D97706", "#0891B2", "#0E7490", "#B45309", "#F4A261", "#CB997E", "#7C3AED", "#2563EB", "#059669",
  ],
  // Coral reef health: teal (good), cyan (near threatened), amber (vulnerable), orange (endangered), red (critical)
  "coral-reefs": [
    "#2DD4BF", "#22D3EE", "#FBBF24", "#F97316", "#EF4444",
  ],
  // Rainforest intactness: pristine (darkest green) → critical (red)
  rainforests: [
    "#064E3B", "#0D7A3A", "#65A30D", "#D97706", "#DC2626",
  ],
  // Water scarcity gradient: blue (low stress) → cyan (low-medium) → yellow (medium-high) → orange (high) → red (extremely high)
  "water-scarcity": [
    "#3B82F6", "#06B6D4", "#EAB308", "#F97316", "#EF4444",
  ],
  // Wildfire risk gradient: yellow (low) → orange (moderate) → red (high) → dark red (extreme)
  "wildfire-risk": [
    "#EAB308", "#F97316", "#EF4444", "#991B1B",
  ],
  // Light pollution Bortle scale: dark blue/black (pristine class 1-2) → white/yellow (inner city class 9), blue for dark sky places
  "light-pollution": [
    "#0A0A2E", "#0D1B3E", "#1A3A5C", "#2D5A7B", "#4A7A3A",
    "#8B8B00", "#CC8800", "#FF6600", "#FFCC00", "#3B82F6",
  ],
  // Endangered species IUCN status: yellow (Vulnerable), orange (Endangered), red (Critically Endangered)
  "endangered-species": [
    "#EAB308", "#F97316", "#EF4444",
  ],
  // Ocean currents: blue (cold), purple (deep), red/orange (warm) — sorted alphabetically: Cold, Deep, Warm
  "ocean-currents": [
    "#3B82F6", "#8B5CF6", "#EF4444",
  ],
  // Desertification aridity gradient: dark brown (hyper-arid), tan (arid), light yellow (semi-arid), pale green (dry sub-humid)
  desertification: [
    "#6B3A2A", "#C8A86E", "#E8D44D", "#8FBC8F",
  ],
  // Ancient civilizations: warm earthy tones for civilization polygons, green/blue for archaeological sites
  "ancient-civilizations": [
    "#8B6914", "#B8860B", "#CD853F", "#A0522D", "#D2691E",
    "#8B4513", "#DAA520", "#C68642", "#B87333", "#996515",
    "#6B4226", "#CC7722", "#E2A76F", "#9B7653", "#80461B",
    "#A67B5B", "#7B3F00", "#4A7A3A", "#2E8B57", "#556B2F",
    "#8FBC8F", "#4682B4", "#5F9EA0",
  ],
  // Historical empires: 30 distinct colors for semi-transparent polygon overlays, grouped by era
  "historical-empires": [
    "#8B0000", "#DAA520", "#4169E1", "#228B22", "#FF6347",
    "#6A0DAD", "#CD853F", "#DC143C", "#2E8B57", "#FF8C00",
    "#4682B4", "#B22222", "#9ACD32", "#8B4513", "#FF69B4",
    "#00CED1", "#7B68EE", "#D2691E", "#20B2AA", "#C71585",
    "#556B2F", "#FF4500", "#5F9EA0", "#800080", "#FFDAB9",
    "#BDB76B", "#708090", "#FF1493", "#3CB371", "#A0522D",
  ],
  // Music tradition family colors: 15 families sorted alphabetically — vibrant, globally-inspired palette
  "music-regions": [
    "#E91E63", "#00BCD4", "#9C27B0", "#FF9800", "#E91E63",
    "#4CAF50", "#FF5722", "#795548", "#2196F3", "#F44336",
    "#3F51B5", "#009688", "#CDDC39", "#607D8B", "#8BC34A",
  ],
  // Warm/appetizing tones for cuisine regions: sorted by family — African, Chinese, East Asian, Latin American, Mediterranean, Middle Eastern, North African, Northern European, South Asian, Southeast Asian, Western European
  "cuisine-regions": [
    "#D35400", "#E74C3C",
    "#C0392B", "#E74C3C", "#D4AC0D", "#F39C12", "#E67E22", "#D35400", "#B7950B", "#A04000",
    "#F1C40F", "#E67E22",
    "#E74C3C", "#F39C12", "#D35400", "#E67E22",
    "#C0392B", "#D4AC0D",
    "#B7950B", "#E67E22",
    "#F39C12",
    "#A04000",
    "#D35400", "#C0392B",
    "#E74C3C", "#F39C12",
    "#D4AC0D", "#B7950B",
  ],
  // Festival type colors: purple (Religious), pink (Cultural), green (Seasonal), blue (National)
  festivals: [
    "#8B5CF6", "#E91E63", "#22C55E", "#3B82F6",
  ],
  // Migration patterns: sky blue (bird flyways), amber (human migration corridors)
  migration: [
    "#0EA5E9", "#F59E0B",
  ],
};

export function getPluginPalette(pluginId: string): string[] {
  return PLUGIN_PALETTES[pluginId] ?? PLUGIN_PALETTES.languages;
}

export function formatSpeakers(count: number): string {
  if (count >= 1_000_000_000) {
    const value = count / 1_000_000_000;
    return `${parseFloat(value.toFixed(1))}B`;
  }
  if (count >= 1_000_000) {
    return `${Math.round(count / 1_000_000)}M`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  return count.toString();
}
