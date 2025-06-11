"use server";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { GEOAPIFY_CONFIG } from "@/config/geoapify";
import { GeoapifyError, GeoapifyResponse, Coordinates } from "@/types/geoapify";
import {
  validateFeatureInIsrael,
  areCitiesEqual,
  normalizeCityName,
  isStreetMatch,
  validateSearchInput,
} from "@/utils/geoapify-helpers";

/**
 * Validates that the Geoapify API key is present in the configuration.
 * Throws a GeoapifyError if missing.
 */
function validateConfig(): void {
  if (!GEOAPIFY_CONFIG.API_KEY) {
    throw new GeoapifyError(
      "GEOAPIFY_API_KEY environment variable is required. Please set it in your .env.local file."
    );
  }
}

/**
 * Makes a request to the Geoapify API with retry and timeout logic.
 * Handles errors, rate limits, and response validation.
 *
 * @param endpoint - The Geoapify API endpoint (e.g., "search").
 * @param params - URLSearchParams containing query parameters.
 * @param retries - Number of retry attempts on failure.
 * @returns Parsed GeoapifyResponse object.
 * @throws GeoapifyError on failure after retries.
 */
async function makeGeoapifyRequest(
  endpoint: string,
  params: URLSearchParams,
  retries = GEOAPIFY_CONFIG.MAX_RETRIES
): Promise<GeoapifyResponse> {
  validateConfig();

  params.append("apiKey", GEOAPIFY_CONFIG.API_KEY!);
  params.append("lang", "he");
  params.append("format", "geojson");

  const url = `${GEOAPIFY_CONFIG.BASE_URL}/${endpoint}?${params.toString()}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEOAPIFY_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Next.js App",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429 && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        throw new GeoapifyError(`API request failed: ${response.status} ${response.statusText}`, response.status);
      }

      const data: GeoapifyResponse = await response.json();

      if (!data.features) {
        throw new GeoapifyError("Invalid API response: missing features");
      }

      return data;
    } catch (error) {
      if (attempt === retries) {
        if (error instanceof GeoapifyError) throw error;

        throw new GeoapifyError(
          `Network error after ${retries + 1} attempts: ${error instanceof Error ? error.message : "Unknown error"}`,
          undefined,
          error instanceof Error ? error : undefined
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  throw new GeoapifyError("Max retries exceeded");
}

/**
 * Looks up coordinates for a given city name in Israel (uncached).
 * @param city - The city name to search for.
 * @returns Coordinates if found, or null.
 * @throws GeoapifyError on API or network errors.
 */
const getCityCoordinatesUncached = async (city: string): Promise<Coordinates | null> => {
  validateSearchInput(city, "city");

  try {
    const params = new URLSearchParams({
      text: city.trim(),
      filter: "countrycode:il",
      type: "city",
      limit: "10",
    });

    const data = await makeGeoapifyRequest("search", params);

    if (data.features.length === 0) return null;

    // Prefer exact city match, fallback to first valid Israeli feature
    const feature =
      data.features
        .filter(validateFeatureInIsrael)
        .find((f) => f.properties.city && areCitiesEqual(f.properties.city, city)) ||
      data.features.find(validateFeatureInIsrael);

    if (!feature) return null;

    const { lat, lon } = feature.properties;
    return {
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lon.toFixed(6)),
    };
  } catch (error) {
    console.error(`Failed to get coordinates for city "${city}":`, error);
    throw error instanceof GeoapifyError
      ? error
      : new GeoapifyError(
          `Failed to get city coordinates: ${error instanceof Error ? error.message : "Unknown error"}`,
          undefined,
          error instanceof Error ? error : undefined
        );
  }
};

/**
 * Memoized version of getCityCoordinatesUncached, used for caching.
 */
const getCityCoordinatesMemoized = cache(getCityCoordinatesUncached);

/**
 * Gets the coordinates for a city name, using cache for performance.
 * @param city - The city name.
 * @returns Coordinates if found, or null.
 */
export const getCityCoordinates = unstable_cache(getCityCoordinatesMemoized, ["city-coordinates"], {
  revalidate: GEOAPIFY_CONFIG.CACHE_DURATION,
  tags: ["geoapify", "cities"],
});

/**
 * Searches for cities in Israel matching the provided keyword.
 * Filters out duplicates and normalizes city names.
 * @param keyword - User-input search keyword.
 * @returns Array of unique city names.
 * @throws GeoapifyError on API or network errors.
 */
export const searchCities = unstable_cache(
  async (keyword: string): Promise<string[]> => {
    validateSearchInput(keyword, "keyword");

    try {
      const params = new URLSearchParams({
        text: keyword.trim(),
        filter: "countrycode:il",
        type: "city",
        limit: "50",
      });

      const data = await makeGeoapifyRequest("search", params);
      if (data.features.length === 0) return [];
      const citiesMap = new Map<string, string>();

      data.features.filter(validateFeatureInIsrael).forEach((feature) => {
        const { properties } = feature;
        const cityName = properties.city || properties.name;
        if (
          cityName &&
          (properties.result_type === "city" ||
            properties.result_type === "locality" ||
            properties.result_type === "municipality")
        ) {
          const normalizedCity = normalizeCityName(cityName);
          console.log(normalizedCity);
          if (!citiesMap.has(normalizedCity) || cityName.length < citiesMap.get(normalizedCity)!.length) {
            citiesMap.set(normalizedCity, cityName.trim());
          }
        }
      });
      return Array.from(citiesMap.values()).sort();
    } catch (error) {
      console.error(`Failed to search cities with keyword "${keyword}":`, error);
      throw error instanceof GeoapifyError
        ? error
        : new GeoapifyError(
            `Failed to search cities: ${error instanceof Error ? error.message : "Unknown error"}`,
            undefined,
            error instanceof Error ? error : undefined
          );
    }
  },
  ["search-cities"],
  {
    revalidate: GEOAPIFY_CONFIG.CACHE_DURATION,
    tags: ["geoapify", "cities"],
  }
);

/**
 * Searches for street names in a given city.
 * Only includes streets that match the keyword and are in the specified city.
 * @param streetKeyword - The partial or full street name to search for.
 * @param city - The city to search within.
 * @returns Array of unique street names.
 * @throws GeoapifyError on API or network errors.
 */
export const searchStreets = unstable_cache(
  async (streetKeyword: string, city: string): Promise<string[]> => {
    validateSearchInput(streetKeyword, "street keyword");
    validateSearchInput(city, "city");

    try {
      const cityCoords = await getCityCoordinates(city);
      if (!cityCoords) {
        throw new GeoapifyError(`City not found: ${city}`);
      }

      const params = new URLSearchParams({
        text: `${streetKeyword.trim()}, ${city.trim()}`,
        filter: `countrycode:il|circle:${cityCoords.longitude},${cityCoords.latitude},${GEOAPIFY_CONFIG.DEFAULT_RADIUS}`,
        type: "street",
        limit: "50",
      });

      const data = await makeGeoapifyRequest("search", params);

      if (data.features.length === 0) return [];

      const streets = new Set<string>();

      data.features.filter(validateFeatureInIsrael).forEach((feature) => {
        const { properties } = feature;

        if (!properties.city || !areCitiesEqual(properties.city, city)) return;

        let streetName = properties.street || properties.name || properties.address_line1;

        if (
          streetName &&
          (properties.result_type === "street" ||
            properties.result_type === "amenity" ||
            properties.result_type === "building")
        ) {
          // Remove house numbers and trailing commas/descriptions
          streetName = streetName.replace(/\d+/g, "").replace(/,.*$/, "").trim();

          if (streetName && isStreetMatch(streetName, streetKeyword)) {
            streets.add(streetName);
          }
        }
      });

      return Array.from(streets).sort();
    } catch (error) {
      console.error(`Failed to search streets "${streetKeyword}" in "${city}":`, error);
      throw error instanceof GeoapifyError
        ? error
        : new GeoapifyError(
            `Failed to search streets: ${error instanceof Error ? error.message : "Unknown error"}`,
            undefined,
            error instanceof Error ? error : undefined
          );
    }
  },
  ["search-streets"],
  {
    revalidate: GEOAPIFY_CONFIG.CACHE_DURATION,
    tags: ["geoapify", "streets"],
  }
);

/**
 * Looks up latitude/longitude coordinates for a full address (street, city, and optional street number).
 * Tries to maximize address matching accuracy by using different query formats.
 * @param address - The street name or address line.
 * @param city - The city name.
 * @param streetNumber - Optional street/house number.
 * @returns Coordinates if found, or null.
 * @throws GeoapifyError on API or network errors.
 */
export const getCoordinates = unstable_cache(
  async (address: string, city: string, streetNumber?: number): Promise<Coordinates | null> => {
    validateSearchInput(address, "address");
    validateSearchInput(city, "city");

    try {
      const cityCoords = await getCityCoordinates(city);
      if (!cityCoords) {
        throw new GeoapifyError(`City not found: ${city}`);
      }

      const queries = [
        streetNumber ? `${address.trim()} ${streetNumber}, ${city.trim()}` : null,
        `${address.trim()}, ${city.trim()}`,
      ].filter(Boolean) as string[];

      for (const query of queries) {
        const params = new URLSearchParams({
          text: query,
          filter: `countrycode:il|circle:${cityCoords.longitude},${cityCoords.latitude},${GEOAPIFY_CONFIG.DEFAULT_RADIUS}`,
          limit: "10",
        });

        try {
          const data = await makeGeoapifyRequest("search", params);

          if (data.features.length === 0) continue;

          let bestFeature = null;

          for (const feature of data.features.filter(validateFeatureInIsrael)) {
            const { properties } = feature;

            if (!properties.city || !areCitiesEqual(properties.city, city)) continue;

            if (streetNumber) {
              const formatted = properties.formatted || "";
              if (formatted.includes(streetNumber.toString())) {
                bestFeature = feature;
                break;
              }
            }

            if (!bestFeature) {
              bestFeature = feature;
            }
          }

          if (bestFeature) {
            const { lat, lon } = bestFeature.properties;
            return {
              latitude: parseFloat(lat.toFixed(6)),
              longitude: parseFloat(lon.toFixed(6)),
            };
          }
        } catch (error) {
          console.warn(`Geocoding query failed: ${query}`, error);
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to get coordinates for "${address}" in "${city}":`, error);
      throw error instanceof GeoapifyError
        ? error
        : new GeoapifyError(
            `Failed to get coordinates: ${error instanceof Error ? error.message : "Unknown error"}`,
            undefined,
            error instanceof Error ? error : undefined
          );
    }
  },
  ["get-coordinates"],
  {
    revalidate: GEOAPIFY_CONFIG.CACHE_DURATION,
    tags: ["geoapify", "coordinates"],
  }
);

//TODO: Move this to a separate file if it grows larger
// -----------------------
// Cache Management
// -----------------------

/**
 * Revalidate all Geoapify related cache entries by tag.
 */
export async function revalidateGeoapifyCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("geoapify");
}

export async function revalidateCitiesCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("cities");
}

export async function revalidateStreetsCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("streets");
}
