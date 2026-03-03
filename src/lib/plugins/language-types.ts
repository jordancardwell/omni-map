export interface LanguageSpeakers {
  native: number;
  total: number;
  source: string;
}

export interface LanguageResource {
  title: string;
  url: string;
}

export interface LanguageMetadata {
  code: string;
  name: string;
  nativeName: string;
  family: string;
  branch: string;
  speakers: LanguageSpeakers;
  regions: string[];
  writingSystem: string;
  dialects: string[];
  endangermentStatus: string;
  description: string;
  historicalNotes: string;
  relatedLanguages: string[];
  resources: LanguageResource[];
  geojson: string;
}

export const REQUIRED_LANGUAGE_FIELDS: (keyof LanguageMetadata)[] = [
  "code",
  "name",
  "nativeName",
  "family",
  "branch",
  "speakers",
  "regions",
  "writingSystem",
  "dialects",
  "endangermentStatus",
  "description",
  "historicalNotes",
  "relatedLanguages",
  "resources",
  "geojson",
];
