import * as z from "zod";

const phonePattern = /^(\+?\d{1,4}[\s-]?)?(\d{8,15})$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const contactInfoSchema = z.string().refine(
  (value) => {
    return emailPattern.test(value) || phonePattern.test(value);
  },
  {
    message: "פרטי התקשרות חייבים להיות כתובת אימייל או מספר טלפון תקינים",
  }
);

export const formSchema = z.object({
  business_name: z.string().min(2, { message: "שם העסק חייב להכיל לפחות 2 תווים" }),
  business_phone: z.string().regex(phonePattern, { message: "מספר טלפון לא תקין" }),
  business_details: z.string().min(10, { message: "פרטי העסק חייבים להכיל לפחות 10 תווים" }),
  location: z.object({
    region: z.string().min(2, { message: "אזור חייב להכיל לפחות 2 תווים" }),
    street_number: z.number().positive({ message: "מספר רחוב חייב להיות חיובי" }),
    address: z.string().min(2, { message: "כתובת חייבת להכיל לפחות 2 תווים" }),
    city: z.string().min(2, { message: "עיר חייבת להכיל לפחות 2 תווים" }),
    location_details: z.string().optional(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
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
    name: z.string().min(3, { message: "שם המשגיח חייב להכיל לפחות 3 תווים" }),
    contact_info: contactInfoSchema,
    authority: z.string().min(5, { message: "רשות הפיקוח חייבת להכיל לפחות 5 תווים" }),
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
