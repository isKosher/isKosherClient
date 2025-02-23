interface LookupData {
  food_types: Array<{ id: string; name: string }>;
  business_types: Array<{ id: string; name: string }>;
  kosher_types: Array<{ id: string; name: string; kosher_icon_url: string }>;
  food_item_types: Array<{ id: string; name: string }>;
}

export async function fetchLookupData(): Promise<LookupData> {
  try {
    const response = await fetch("https://iskoshermanager.onrender.com/api/v1/lookup");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);

    return data;
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
