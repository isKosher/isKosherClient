"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    // Test user data
    const userData = {
      id: "1",
      name: "ישראל ישראלי",
      email: email,
    };

    login(userData);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-pattern bg-cover bg-center">
      <div className="mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">
              התחברות
            </h2>
            <p className="text-[#2D4A6D] text-md">
              התחבר כדי לראות את המסעדות המועדפות שלך
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full py-6 border-2 border-[#1A365D]/20"
            onClick={handleSubmit}
          >
            <FcGoogle className="h-5 w-5 ml-2" />
            התחבר עם Google
          </Button>
        </div>
      </div>
    </div>
  );
}
