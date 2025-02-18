"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await login(user);

      router.push("/dashboard");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setError(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern bg-cover bg-center">
      <div className="mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">התחברות</h2>
            <p className="text-[#2D4A6D] text-md">התחבר כדי לראות את המסעדות המועדפות שלך</p>
          </div>
          {error && <div className="mb-4 p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
          <Button
            type="button"
            variant="outline"
            className="w-full py-6 border-2 border-[#1A365D]/20"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <FcGoogle className="h-5 w-5 ml-2" />
            {isLoading ? "מתחבר..." : "התחבר עם Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
