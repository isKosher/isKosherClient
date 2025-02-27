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

const regions = ["צפון", "חיפה", "מרכז", "תל אביב", "ירושלים", "דרום", "יהודה ושומרון"];

// פונקציה שמחזירה את כל האזורים
export async function getRegions(): Promise<string[]> {
  // במקרה אמיתי, זו תהיה קריאת API לשרת:
  // const response = await fetch('/api/regions');
  // return response.json();

  // במקום זאת, נחזיר את הרשימה הסטטית:
  return new Promise((resolve) => {
    // מדמה השהייה של רשת
    setTimeout(() => {
      resolve(regions);
    }, 300);
  });
}
