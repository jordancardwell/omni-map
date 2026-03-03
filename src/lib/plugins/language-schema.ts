import { REQUIRED_LANGUAGE_FIELDS, type LanguageMetadata } from "./language-types";

/**
 * Validates that a parsed language JSON object has all required fields
 * with correct types. Returns an array of error messages (empty if valid).
 */
export function validateLanguageMetadata(
  data: Record<string, unknown>
): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_LANGUAGE_FIELDS) {
    if (!(field in data)) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  if (errors.length > 0) return errors;

  const stringFields = [
    "code",
    "name",
    "nativeName",
    "family",
    "branch",
    "writingSystem",
    "endangermentStatus",
    "description",
    "historicalNotes",
    "geojson",
  ] as const;

  for (const field of stringFields) {
    if (typeof data[field] !== "string") {
      errors.push(`Field "${field}" must be a string`);
    }
  }

  // Validate speakers object
  if (typeof data.speakers !== "object" || data.speakers === null || Array.isArray(data.speakers)) {
    errors.push(`Field "speakers" must be an object`);
  } else {
    const speakers = data.speakers as Record<string, unknown>;
    if (typeof speakers.native !== "number") {
      errors.push(`Field "speakers.native" must be a number`);
    }
    if (typeof speakers.total !== "number") {
      errors.push(`Field "speakers.total" must be a number`);
    }
    if (typeof speakers.source !== "string") {
      errors.push(`Field "speakers.source" must be a string`);
    }
  }

  // Validate string arrays
  const stringArrayFields = ["regions", "dialects", "relatedLanguages"] as const;
  for (const field of stringArrayFields) {
    if (!Array.isArray(data[field])) {
      errors.push(`Field "${field}" must be an array`);
    } else if (!(data[field] as unknown[]).every((item) => typeof item === "string")) {
      errors.push(`Field "${field}" must be an array of strings`);
    }
  }

  // Validate resources array
  if (!Array.isArray(data.resources)) {
    errors.push(`Field "resources" must be an array`);
  } else {
    for (let i = 0; i < (data.resources as unknown[]).length; i++) {
      const resource = (data.resources as unknown[])[i];
      if (typeof resource !== "object" || resource === null || Array.isArray(resource)) {
        errors.push(`Field "resources[${i}]" must be an object`);
        continue;
      }
      const r = resource as Record<string, unknown>;
      if (typeof r.title !== "string") {
        errors.push(`Field "resources[${i}].title" must be a string`);
      }
      if (typeof r.url !== "string") {
        errors.push(`Field "resources[${i}].url" must be a string`);
      }
    }
  }

  return errors;
}

/**
 * Type guard that validates and narrows unknown data to LanguageMetadata.
 */
export function isLanguageMetadata(
  data: Record<string, unknown>
): data is LanguageMetadata & Record<string, unknown> {
  return validateLanguageMetadata(data).length === 0;
}
