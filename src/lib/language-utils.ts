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
