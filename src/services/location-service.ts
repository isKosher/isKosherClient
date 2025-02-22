// This is a mock service that simulates API calls
// Replace these with actual API calls when ready

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulated database of cities by area
const citiesByArea: Record<string, string[]> = {
  north: ["צפת", "טבריה", "כרמיאל", "נהריה", "עכו", "קריית שמונה"],
  haifa: ["חיפה", "קריית ביאליק", "קריית ים", "קריית מוצקין", "טירת כרמל"],
  sharon: ["הרצליה", "רעננה", "כפר סבא", "הוד השרון", "רמת השרון", "נתניה"],
  center: ["פתח תקווה", "ראש העין", "רמת גן", "גבעתיים", "בני ברק"],
  "tel-aviv": ["תל אביב-יפו", "בת ים", "חולון", "רמת גן", "גבעתיים"],
  jerusalem: ["ירושלים", "בית שמש", "מבשרת ציון", "מעלה אדומים"],
  lowlands: ["רחובות", "נס ציונה", "ראשון לציון", "לוד", "רמלה"],
  south: ["באר שבע", "אשדוד", "אשקלון", "קריית גת", "נתיבות", "אופקים"],
  eilat: ["אילת", "מצפה רמון", "ירוחם", "דימונה"],
  "judea-samaria": ["אריאל", "מעלה אדומים", "אפרת", "ביתר עילית", "מודיעין עילית"],
};

// Simulated streets database
const commonStreets = [
  "הרצל",
  "ויצמן",
  "בן גוריון",
  "ז'בוטינסקי",
  "אלנבי",
  "דיזנגוף",
  "רוטשילד",
  "ביאליק",
  "הנביאים",
  "המלך דוד",
];

export async function getCitiesByArea(areaId: string): Promise<string[]> {
  await delay(500); // Simulate network delay
  return citiesByArea[areaId] || [];
}

export async function getStreetsByCity(city: string): Promise<string[]> {
  await delay(500); // Simulate network delay
  // In a real API, you would fetch streets specific to the city
  // For now, return common streets with a random suffix to simulate different streets
  return commonStreets.map((street) => `${street} ${Math.floor(Math.random() * 3) + 1}`);
}
