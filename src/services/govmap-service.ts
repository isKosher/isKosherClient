declare global {
  interface Window {
    govmap: any;
  }
}
interface GovmapResult {
  ResultLable: string;
  X: number;
  Y: number;
  ObjectID: string;
}
let isInitialized = false;
export async function initGovmap(): Promise<boolean> {
  if (isInitialized) return true;
  try {
    await new Promise<void>((resolve, reject) => {
      const jqueryScript = document.createElement("script");
      jqueryScript.src = "https://code.jquery.com/jquery-1.12.1.min.js";
      jqueryScript.onload = () => {
        const govmapScript = document.createElement("script");
        govmapScript.src = "https://www.govmap.gov.il/govmap/api/govmap.api.js";
        govmapScript.onload = () => {
          window.govmap.createMap("hidden-map", {
            token: "e52ff3db-543a-47eb-af5f-6b7a5da000fc",
            layers: [],
            showXY: false,
            identifyOnClick: false,
            isEmbeddedToggle: false,
            background: 0,
            layersMode: 1,
            zoomButtons: false,
          });
          isInitialized = true;
          resolve();
        };
        govmapScript.onerror = reject;
        document.body.appendChild(govmapScript);
      };
      jqueryScript.onerror = reject;
      document.body.appendChild(jqueryScript);
    });
    return true;
  } catch (error) {
    console.error("Failed to initialize GOVMAP:", error);
    return false;
  }
}
export async function searchCities(keyword: string): Promise<string[]> {
  if (!isInitialized) {
    await initGovmap();
  }
  try {
    const response = await window.govmap.geocode({
      keyword: keyword,
      type: window.govmap.geocodeType.FullResult,
    });
    if (!response?.data) {
      return [];
    } // Extract unique city names
    const cities = new Set<string>();
    response.data.forEach((result: GovmapResult) => {
      const parts = result.ResultLable.split(",");
      if (parts.length > 1) {
        // If there's a comma, take the last part (city name)
        const cityName = parts[parts.length - 1].trim();
        cities.add(cityName);
      } else {
        // If there's no comma, check if it's a city name (not a street or place)
        const singleName = parts[0].trim();
        if (!singleName.includes("|")) {
          cities.add(singleName);
        }
      }
    });
    return Array.from(cities);
  } catch (error) {
    console.error("Error searching cities:", error);
    return [];
  }
}
export async function searchStreets(street: string, city: string): Promise<string[]> {
  if (!isInitialized) {
    await initGovmap();
  }
  try {
    const response = await window.govmap.geocode({
      keyword: `${street} ${city}`,
      type: window.govmap.geocodeType.FullResult,
    });
    if (!response?.data) {
      return [];
    }
    const streets = new Set<string>();
    response.data.forEach((result: GovmapResult) => {
      const parts = result.ResultLable.split(",");
      if (parts.length >= 2) {
        const streetName = parts[0].replace(/\d+/g, "").trim();
        streets.add(streetName);
      }
    });
    return Array.from(streets);
  } catch (error) {
    console.error("Error searching streets:", error);
    return [];
  }
}
