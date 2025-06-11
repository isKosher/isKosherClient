import { GEOAPIFY_CONFIG } from "@/config/geoapify";
import { GeoapifyError, GeoapifyFeature } from "@/types/geoapify";

export function normalizeHebrewText(text: string): string {
  return text
    .trim()
    .replace(/[\u0591-\u05C7]/g, "") // Remove Hebrew diacritics
    .replace(/\s+/g, " ")
    .replace(/-/g, " ")
    .toLowerCase();
}

export function normalizeCityName(cityName: string): string {
  return normalizeHebrewText(cityName)
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateSearchInput(keyword: string, fieldName = "keyword"): void {
  if (!keyword?.trim()) {
    throw new GeoapifyError(`${fieldName} is required and cannot be empty`);
  }
  if (keyword.trim().length < 2) {
    throw new GeoapifyError(`${fieldName} must be at least 2 characters long`);
  }
}

export function areCitiesEqual(city1: string, city2: string): boolean {
  return normalizeCityName(city1) === normalizeCityName(city2);
}

export function isWithinIsraelBounds(lat: number, lon: number): boolean {
  return (
    lat >= GEOAPIFY_CONFIG.ISRAEL_BOUNDS.south &&
    lat <= GEOAPIFY_CONFIG.ISRAEL_BOUNDS.north &&
    lon >= GEOAPIFY_CONFIG.ISRAEL_BOUNDS.west &&
    lon <= GEOAPIFY_CONFIG.ISRAEL_BOUNDS.east
  );
}

export function validateFeatureInIsrael(feature: GeoapifyFeature): boolean {
  const { properties } = feature;
  return isWithinIsraelBounds(properties.lat, properties.lon) && properties.country_code === "il";
}

export function isStreetMatch(streetName: string, searchTerm: string): boolean {
  const normalizedStreet = normalizeHebrewText(streetName);
  const normalizedSearch = normalizeHebrewText(searchTerm);

  if (normalizedStreet.includes(normalizedSearch)) {
    return true;
  }

  const streetWords = normalizedStreet.split(" ");
  const searchWords = normalizedSearch.split(" ");

  return searchWords.some(
    (searchWord) =>
      searchWord.length > 2 &&
      streetWords.some((streetWord) => streetWord.includes(searchWord) || searchWord.includes(streetWord))
  );
}
