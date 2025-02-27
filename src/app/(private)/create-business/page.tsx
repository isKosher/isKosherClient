"use client";

import { KosherBusinessForm } from "@/app/(private)/create-business/kosher-business-form";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { KosherBusinessFormWrapper } from "./kosher-business-form-wrapper";

export default function CreateBusinessPage() {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="container mx-auto p-4 " dir="rtl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          }
        >
          <KosherBusinessFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
