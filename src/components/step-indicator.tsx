import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  stepIndex: number;
  title: string;
  isValid: boolean;
  isActive: boolean;
  wasAttempted: boolean;
}

export function StepIndicator({
  currentStep,
  stepIndex,
  title,
  isValid,
  isActive,
  wasAttempted,
}: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          isActive && "ring-2 ring-[#1A365D]",
          isValid
            ? "bg-[#1A365D] text-white"
            : stepIndex <= currentStep
            ? "bg-[#1A365D] text-white"
            : "bg-gray-200 text-gray-600"
        )}
      >
        {isValid ? <Check className="h-4 w-4" /> : <span>{stepIndex + 1}</span>}
      </div>
      <span className="mt-2 text-sm hidden md:block">{title}</span>
      {!isValid && isActive && wasAttempted && (
        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
      )}
    </div>
  );
}
