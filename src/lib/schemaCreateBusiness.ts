import * as z from "zod";

export const formSchema = z.object({
  business_name: z.string().min(2, { message: "שם העסק חייב להכיל לפחות 2 תווים" }),
  business_phone: z.string().regex(/^0\d{8,9}$/, { message: "מספר טלפון לא תקין" }),
  business_details: z.string().min(10, { message: "פרטי העסק חייבים להכיל לפחות 10 תווים" }),
  location: z.object({
    area: z.object({
      id: z.string().min(1, { message: "יש לבחור אזור" }),
      name: z.string().min(1, { message: "יש לבחור אזור" }),
    }),
    street_number: z.number().positive({ message: "מספר רחוב חייב להיות חיובי" }),
    address: z.string().min(2, { message: "כתובת חייבת להכיל לפחות 2 תווים" }),
    city: z.string().min(2, { message: "עיר חייבת להכיל לפחות 2 תווים" }),
    location_details: z.string().optional(),
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
        id: z.string().min(1),
        name: z.string().min(1),
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
  isCustom?: boolean;
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
  { id: "1", name: "מסעדה" },
  { id: "2", name: "בית קפה" },
  { id: "3", name: "מאפייה" },
  { id: "4", name: "סופרמרקט" },
  { id: "5", name: "קייטרינג" },
  { id: "6", name: "מעדנייה" },
  { id: "7", name: "בר" },
  { id: "8", name: "דוכן מזון" },
  { id: "9", name: "חנות ממתקים" },
  { id: "10", name: "אטליז" },
];

export const kosherTypes: Option[] = [
  { id: "1", name: "כשר למהדרין" },
  { id: "2", name: "כשר רגיל" },
  { id: "3", name: "גלאט כשר" },
  { id: "4", name: "חלב ישראל" },
  { id: "5", name: "פת ישראל" },
  { id: "6", name: "בד״ץ" },
  { id: "7", name: "רבנות ראשית" },
  { id: "8", name: "מהדרין מן המהדרין" },
];

export const foodTypes = [
  { id: "dairy", name: "חלבי" },
  { id: "meat", name: "בשרי" },
  { id: "parve", name: "פרווה" },
] as const;

export const foodItems: Option[] = [
  { id: "1", name: "פלאפל" },
  { id: "2", name: "שווארמה" },
  { id: "3", name: "פיצה" },
  { id: "4", name: "סושי" },
  { id: "5", name: "המבורגר" },
  { id: "6", name: "סלט" },
  { id: "7", name: "מרק" },
  { id: "8", name: "דגים" },
  { id: "9", name: "פסטה" },
  { id: "10", name: "סנדוויצ׳ים" },
  { id: "11", name: "מאפים" },
  { id: "12", name: "קינוחים" },
  { id: "13", name: "גלידה" },
  { id: "14", name: "שתייה" },
  { id: "15", name: "חומוס" },
  { id: "16", name: "שניצל" },
  { id: "17", name: "אורז" },
  { id: "18", name: "תבשילים" },
  { id: "19", name: "מנות צמחוניות" },
  { id: "20", name: "מנות טבעוניות" },
];

export const areas = [
  { id: "north", name: "צפון" },
  { id: "haifa", name: "חיפה והקריות" },
  { id: "sharon", name: "השרון" },
  { id: "center", name: "מרכז" },
  { id: "tel-aviv", name: "תל אביב והסביבה" },
  { id: "jerusalem", name: "ירושלים והסביבה" },
  { id: "lowlands", name: "שפלה" },
  { id: "south", name: "דרום" },
  { id: "eilat", name: "אילת והערבה" },
  { id: "judea-samaria", name: "יהודה ושומרון" },
] as const;
