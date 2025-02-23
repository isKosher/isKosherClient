"use client";

import { KosherBusinessForm } from "@/app/(private)/create-business/kosher-business-form";

export default function CreateBusinessPage() {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="container mx-auto p-4 " dir="rtl">
        <KosherBusinessForm />
      </div>
    </div>
  );
}
