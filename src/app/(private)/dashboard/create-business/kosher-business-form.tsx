"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Step1BusinessDetails } from "./(stepsCreateBusiness)/step-1-business-details";
import { Step2Location } from "./(stepsCreateBusiness)/step-2-location";
import { Step3FoodAndKosher } from "./(stepsCreateBusiness)/step-3-food-and-kosher";
import { Step4Supervision } from "./(stepsCreateBusiness)/step-4-supervision";
import { Step5Summary } from "./(stepsCreateBusiness)/step-5-summary";
import { formSchema, type FormData } from "@/lib/schemaCreateBusiness";
import { StepIndicator } from "@/components/step-indicator";
import { createBusiness } from "@/app/actions/dashboardAction";

const steps = [
  { title: "פרטי העסק", component: Step1BusinessDetails },
  { title: "מיקום", component: Step2Location },
  { title: "אוכל וכשרות", component: Step3FoodAndKosher },
  { title: "פיקוח", component: Step4Supervision },
  { title: "סיכום", component: Step5Summary },
];

const stepValidationFields = {
  0: ["business_name", "business_phone", "business_details"],
  1: ["location.street_number", "location.address", "location.city", "location.region"],
  2: ["business_type", "kosher_types", "food_types", "food_items"],
  3: [
    "supervisor.name",
    "supervisor.contact_info",
    "supervisor.authority",
    "kosher_certificate.certificate",
    "kosher_certificate.expiration_date",
  ],
  4: [],
};

const defaultValues: FormData = {
  business_name: "",
  business_phone: "",
  business_details: "",
  location: {
    street_number: 0,
    address: "",
    region: "",
    location_details: "",
    city: "",
    longitude: 0,
    latitude: 0,
  },
  business_type: {
    name: "",
    id: "",
    isCustom: false,
  },
  kosher_types: [],
  food_types: [],
  food_items: [],
  supervisor: {
    name: "",
    contact_info: "",
    authority: "",
  },
  kosher_certificate: {
    certificate: "",
    expiration_date: undefined,
  },
};

export function KosherBusinessForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({});
  const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});

  const methods = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await createBusiness(data);
      if (result.success) {
        toast.success("העסק נוצר בהצלחה!", {
          description: "הפרטים נשמרו במערכת",
        });
        methods.reset(defaultValues);
        setCurrentStep(0);
        setStepValidity({});
        setAttemptedSteps({});
        window.location.href = "/dashboard";
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("שגיאה!", {
        description: "אירעה שגיאה בעת יצירת העסק. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = async (stepIndex: number) => {
    const fieldsToValidate = stepValidationFields[stepIndex as keyof typeof stepValidationFields];
    setAttemptedSteps((prev) => ({ ...prev, [stepIndex]: true }));

    const result = await methods.trigger(fieldsToValidate as any);
    setStepValidity((prev) => ({ ...prev, [stepIndex]: result }));

    if (!result) {
      toast.error("שגיאה!", {
        description: "אנא מלא את כל השדות הנדרשים",
      });
      return false;
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <StepIndicator
                key={index}
                currentStep={currentStep}
                stepIndex={index}
                title={step.title}
                isValid={stepValidity[index] || false}
                isActive={currentStep === index}
                wasAttempted={attemptedSteps[index] || false}
              />
            ))}
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-sky-600 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            <CurrentStepComponent />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            onClick={nextStep}
            disabled={currentStep === steps.length - 1 || isSubmitting}
            className="w-28"
          >
            הבא
          </Button>
          <Button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            variant="outline"
            className="w-28"
          >
            הקודם
          </Button>
        </div>

        {currentStep === steps.length - 1 && (
          <div className="flex justify-center">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שולח...
                </>
              ) : (
                "שלח טופס"
              )}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
