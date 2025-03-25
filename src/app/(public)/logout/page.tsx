"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">מתנתק מהמערכת...</h2>
        <p>אנא המתן</p>
      </div>
    </div>
  );
}
