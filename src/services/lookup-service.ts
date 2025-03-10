"use server";
import { regions } from "@/data/staticData";
import { serverApi } from "@/utils/apiClient";

interface LookupData {
  food_types: Array<{ id: string; name: string }>;
  business_types: Array<{ id: string; name: string }>;
  kosher_types: Array<{ id: string; name: string; kosher_icon_url: string }>;
  food_item_types: Array<{ id: string; name: string }>;
}

export async function fetchLookupDataAction(): Promise<LookupData> {
  try {
    const response = await serverApi.get<LookupData>("lookup");
    return response.data;
  } catch (error) {
    console.error("Error fetching lookup data:", error);
    // Return empty arrays as fallback
    return {
      food_types: [],
      business_types: [],
      kosher_types: [],
      food_item_types: [],
    };
  }
}

export async function getRegions(): Promise<string[]> {
  //TODO: Add a function that fetches the regions from the server
  // const response = await fetch('/api/regions');
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(regions);
    }, 300);
  });
}
