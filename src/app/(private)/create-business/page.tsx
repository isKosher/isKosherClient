"use client";

import { KosherBusinessForm } from "@/components/kosher-business-form";

export default function CreateBusinessPage() {
  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">הוסף עסק כשר</h1>
      <KosherBusinessForm />
    </div>
  );
}
