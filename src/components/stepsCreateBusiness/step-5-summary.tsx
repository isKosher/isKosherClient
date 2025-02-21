"use client";

import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { FormData } from "@/lib/schemaCreateBusiness";

export function Step5Summary() {
  const { watch } = useFormContext<FormData>();
  const formData = watch();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-800">סיכום</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">פרטי העסק</h3>
        <p>
          <strong>שם העסק:</strong> {formData.business_name}
        </p>
        <p>
          <strong>טלפון:</strong> {formData.business_phone}
        </p>
        <p>
          <strong>תיאור:</strong> {formData.business_details}
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-4">מיקום</h3>
        <p>
          <strong>כתובת:</strong> {formData.location.address} {formData.location.street_number},{" "}
          {formData.location.city}
        </p>
        <p>
          <strong>אזור:</strong> {formData.location.region}
        </p>
        <p>
          <strong>פרטים נוספים:</strong> {formData.location.location_details}
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-4">אוכל וכשרות</h3>
        <p>
          <strong>סוג העסק:</strong> {formData.business_type?.name}
        </p>
        <p>
          <strong>סוגי כשרות:</strong> {formData.kosher_types?.join(", ")}
        </p>
        <p>
          <strong>סוגי אוכל:</strong> {formData.food_types?.join(", ")}
        </p>
        <p>
          <strong>סוגי פריטי מזון:</strong> {formData.food_items?.join(", ")}
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-4">פיקוח וכשרות</h3>
        <p>
          <strong>שם המשגיח:</strong> {formData.supervisor.name}
        </p>
        <p>
          <strong>פרטי התקשרות:</strong> {formData.supervisor.contact_info}
        </p>
        <p>
          <strong>רשות הפיקוח:</strong> {formData.supervisor.authority}
        </p>
        <p>
          <strong>תאריך תפוגת תעודה:</strong>{" "}
          {formData.kosher_certificate.expiration_date
            ? format(new Date(formData.kosher_certificate.expiration_date), "dd/MM/yyyy")
            : "לא נבחר"}
        </p>
      </div>
    </div>
  );
}
