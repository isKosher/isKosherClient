import { Coordinates } from "@/types";
import proj4 from "proj4";

// Define the coordinate systems
proj4.defs([
  // EPSG:2039 - Israeli TM Grid (ITM)
  [
    "EPSG:2039",
    "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs",
  ],
  // EPSG:4326 - WGS84 (Latitude/Longitude)
  ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"],
]);

/**
 * Converts ITM (Israeli TM Grid) coordinates to WGS84 (Latitude/Longitude)
 * @param {number} x - The X coordinate in ITM
 * @param {number} y - The Y coordinate in ITM
 * @returns {Coordinates} - Returns an object with latitude and longitude properties
 */
export function convertITMToWGS84(x: number, y: number): Coordinates {
  const [lon, lat] = proj4("EPSG:2039", "EPSG:4326", [x, y]);
  return { latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lon.toFixed(6)) }; // Return coordinates as an object
}
