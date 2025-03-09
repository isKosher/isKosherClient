"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const KosherBusinessForm = dynamic(() => import("./kosher-business-form").then((mod) => mod.KosherBusinessForm), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
    </div>
  ),
  ssr: false, // Disable server-side rendering
});

export function KosherBusinessFormWrapper() {
  return <KosherBusinessForm />;
}
