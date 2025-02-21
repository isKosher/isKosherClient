import * as z from "zod";

export const formSchema = z.object({
  business_name: z.string().min(2, { message: "שם העסק חייב להכיל לפחות 2 תווים" }),
  business_phone: z.string().regex(/^0\d{8,9}$/, { message: "מספר טלפון לא תקין" }),
  business_details: z.string().min(10, { message: "פרטי העסק חייבים להכיל לפחות 10 תווים" }),
  location: z.object({
    street_number: z.number().positive({ message: "מספר רחוב חייב להיות חיובי" }),
    address: z.string().min(2, { message: "כתובת חייבת להכיל לפחות 2 תווים" }),
    region: z.string().min(2, { message: "אזור חייב להכיל לפחות 2 תווים" }),
    location_details: z.string().optional(),
    city: z.string().min(2, { message: "עיר חייבת להכיל לפחות 2 תווים" }),
  }),
  business_type: z.object({
    id: z.string().optional(),
    name: z.string().min(2, { message: "סוג העסק חייב להכיל לפחות 2 תווים" }),
    isCustom: z.boolean().default(false),
  }),
  kosher_types: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(2, { message: "סוג כשרות חייב להכיל לפחות 2 תווים" }),
        isCustom: z.boolean().default(false),
      })
    )
    .min(1, { message: "יש לבחור לפחות סוג כשרות אחד" }),
  food_types: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(2, { message: "סוג אוכל חייב להכיל לפחות 2 תווים" }),
        isCustom: z.boolean().default(false),
      })
    )
    .min(1, { message: "יש לבחור לפחות סוג אוכל אחד" }),
  food_items: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(2, { message: "פריט אוכל חייב להכיל לפחות 2 תווים" }),
        isCustom: z.boolean().default(false),
      })
    )
    .min(1, { message: "יש לבחור לפחות פריט אוכל אחד" }),
  supervisor: z.object({
    name: z.string().min(2, { message: "שם המשגיח חייב להכיל לפחות 2 תווים" }),
    contact_info: z.string().email({ message: "כתובת אימייל לא תקינה" }),
    authority: z.string().min(2, { message: "רשות הפיקוח חייבת להכיל לפחות 2 תווים" }),
  }),
  kosher_certificate: z.object({
    certificate: z.any(),
    expiration_date: z.date(),
  }),
});

export type FormData = z.infer<typeof formSchema>;

export interface Option {
  id: string;
  name: string;
  isCustom: boolean; // Ensure isCustom is always a boolean
}

// Export all the static data
export const cities = [
  "תל אביב",
  "ירושלים",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "אשדוד",
  "נתניה",
  "באר שבע",
  "בני ברק",
  "רמת גן",
  "בת ים",
  "רחובות",
  "אשקלון",
  "הרצליה",
  "חולון",
  "כפר סבא",
  "רעננה",
  "מודיעין",
  "רמלה",
  "לוד",
];

export const businessTypes: Option[] = [
  { id: "1", name: "מסעדה", isCustom: false },
  { id: "2", name: "בית קפה", isCustom: false },
  { id: "3", name: "מאפייה", isCustom: false },
  { id: "4", name: "סופרמרקט", isCustom: false },
  { id: "5", name: "קייטרינג", isCustom: false },
  { id: "6", name: "מעדנייה", isCustom: false },
  { id: "7", name: "בר", isCustom: false },
  { id: "8", name: "דוכן מזון", isCustom: false },
  { id: "9", name: "חנות ממתקים", isCustom: false },
  { id: "10", name: "אטליז", isCustom: false },
];

export const kosherTypes: Option[] = [
  { id: "1", name: "כשר למהדרין", isCustom: false },
  { id: "2", name: "כשר רגיל", isCustom: false },
  { id: "3", name: "גלאט כשר", isCustom: false },
  { id: "4", name: "חלב ישראל", isCustom: false },
  { id: "5", name: "פת ישראל", isCustom: false },
  { id: "6", name: "בד״ץ", isCustom: false },
  { id: "7", name: "רבנות ראשית", isCustom: false },
  { id: "8", name: "מהדרין מן המהדרין", isCustom: false },
];

export const foodTypes: Option[] = [
  { id: "1", name: "חלבי", isCustom: false },
  { id: "2", name: "בשרי", isCustom: false },
  { id: "3", name: "פרווה", isCustom: false },
];

export const foodItems: Option[] = [
  { id: "1", name: "פלאפל", isCustom: false },
  { id: "2", name: "שווארמה", isCustom: false },
  { id: "3", name: "פיצה", isCustom: false },
  { id: "4", name: "סושי", isCustom: false },
  { id: "5", name: "המבורגר", isCustom: false },
  { id: "6", name: "סלט", isCustom: false },
  { id: "7", name: "מרק", isCustom: false },
  { id: "8", name: "דגים", isCustom: false },
  { id: "9", name: "פסטה", isCustom: false },
  { id: "10", name: "סנדוויצ׳ים", isCustom: false },
  { id: "11", name: "מאפים", isCustom: false },
  { id: "12", name: "קינוחים", isCustom: false },
  { id: "13", name: "גלידה", isCustom: false },
  { id: "14", name: "שתייה", isCustom: false },
  { id: "15", name: "חומוס", isCustom: false },
  { id: "16", name: "שניצל", isCustom: false },
  { id: "17", name: "אורז", isCustom: false },
  { id: "18", name: "תבשילים", isCustom: false },
  { id: "19", name: "מנות צמחוניות", isCustom: false },
  { id: "20", name: "מנות טבעוניות", isCustom: false },
];
