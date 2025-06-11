export const GEOAPIFY_CONFIG = {
  API_KEY: process.env.GEOAPIFY_API_KEY,
  BASE_URL: "https://api.geoapify.com/v1/geocode",
  ISRAEL_BOUNDS: {
    north: 33.4,
    south: 29.4,
    east: 35.9,
    west: 34.2,
  },
  CACHE_DURATION: 5 * 60, // 5 minutes in seconds
  DEFAULT_RADIUS: 10000, // 10km
  MAX_RETRIES: 2,
  TIMEOUT: 10000, // 10 seconds
} as const;
