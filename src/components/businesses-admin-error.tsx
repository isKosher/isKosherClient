import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BusinessesAdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      variant="destructive"
      className="bg-red-50 border-red-200 text-[#1A365D] flex flex-col gap-2 items-center py-8 rounded-xl shadow-sm"
      dir="rtl"
    >
      <AlertTriangle className="text-red-400 w-8 h-8 mb-2" />
      <AlertTitle className="text-lg font-bold text-[#B91C1C]">אירעה שגיאה</AlertTitle>
      <AlertDescription className="text-[#2D4A6D] mb-3 text-center">
        {message || "אירעה שגיאה בטעינת העסקים. נסה לרענן את הדף או נסה שוב מאוחר יותר."}
      </AlertDescription>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="text-[#1A365D] border-sky-200">
          <RefreshCw className="w-4 h-4 ml-2" />
          נסה שנית
        </Button>
      )}
    </Alert>
  );
}
