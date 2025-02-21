"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData, formSchema } from "@/lib/schemaCreateBusiness";
import { Step5Summary } from "./stepsCreateBusiness/step-5-summary";
import { Step4Supervision } from "./stepsCreateBusiness/step-4-supervision";
import { Step3FoodAndKosher } from "./stepsCreateBusiness/step-3-food-and-kosher";
import { Step2Location } from "./stepsCreateBusiness/step-2-location";
import { Step1BusinessDetails } from "./stepsCreateBusiness/step-1-business-details";
import { createBusiness } from "@/app/actions/dashboardAction";
import { useToast } from "@/components/ui/use-toast";
const steps = [
  { title: "פרטי העסק", component: Step1BusinessDetails },
  { title: "מיקום", component: Step2Location },
  { title: "אוכל וכשרות", component: Step3FoodAndKosher },
  { title: "פיקוח", component: Step4Supervision },
  { title: "סיכום", component: Step5Summary },
];

export function KosherBusinessForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: "",
      business_phone: "",
      business_details: "",
      location: {
        street_number: 0,
        address: "",
        region: "",
        location_details: "",
        city: "",
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
        certificate: undefined,
        expiration_date: new Date(),
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await createBusiness(data);

      if (result.success) {
        toast({
          title: "העסק נוצר בהצלחה!",
          description: "הפרטים נשמרו במערכת",
        });
        methods.reset();
        setCurrentStep(0);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה!",
        description: "אירעה שגיאה בעת יצירת העסק. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = Object.keys(methods.formState.errors);
    if (fields.length > 0) {
      toast({
        variant: "destructive",
        title: "שגיאה!",
        description: "אנא תקן את השגיאות לפני שתמשיך",
      });
      return;
    }
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
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 text-sm hidden md:block">{step.title}</span>
              </div>
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
