"use server";
import { serverApi } from "@/utils/apiClient";

interface LookupData {
  food_types: Array<{ id: string; name: string }>;
  business_types: Array<{ id: string; name: string }>;
  kosher_types: Array<{ id: string; name: string; kosher_icon_url: string }>;
  food_item_types: Array<{ id: string; name: string }>;
}

export async function fetchLookupDataAction(): Promise<LookupData> {
  try {
    const response = await serverApi.get<LookupData>("/lookup", {
      cache: "force-cache",
      tags: ["lookup"],
    });

    return response.json();
  } catch (error) {
    console.error("Error fetching lookup data:", error);
    return {
      food_types: [],
      business_types: [],
      kosher_types: [],
      food_item_types: [],
    };
  }
}
