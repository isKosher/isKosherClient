"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { BusinessPreview, UserOwnedBusinessResponse } from "@/types";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Import the API service
import { updateBusinessDetails, updateBusinessLocation } from "@/app/actions/dashboardAction";
import { useState } from "react";

const formSchema = z.object({
  business_name: z.string().min(2, { message: "שם העסק חייב להכיל לפחות 2 תווים" }),
  business_details: z.string().min(10, { message: "פרטי העסק חייבים להכיל לפחות 10 תווים" }),
  business_number: z.string().min(9, { message: "מספר טלפון לא תקין" }),
  business_type: z.string().min(2, { message: "סוג העסק חייב להכיל לפחות 2 תווים" }),
  address: z.string().min(2, { message: "כתובת חייבת להכיל לפחות 2 תווים" }),
  street_number: z.number().min(1, { message: "מספר רחוב חייב להיות לפחות 1" }),
  city: z.string().min(2, { message: "עיר חייבת להכיל לפחות 2 תווים" }),
});

type BusinessDetailsFormProps = {
  business: UserOwnedBusinessResponse;
  onClose: (refreshData?: boolean, message?: string) => void;
};

export default function BusinessDetailsForm({ business, onClose }: BusinessDetailsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: business.business_name,
      business_details: business.business_details,
      business_number: business.business_number,
      business_type: business.business_type,
      address: business.location.address,
      street_number: business.location.street_number,
      city: business.location.city,
    },
  });

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);

      // First update business details
      const detailsResponse = await updateBusinessDetails({
        businessId: business.business_id,
        businessName: values.business_name,
        businessDetails: values.business_details,
        businessPhone: values.business_number,
        businessType: values.business_type,
      });

      if (detailsResponse.error) {
        throw new Error(detailsResponse.message);
      }

      // Then update location
      const locationResponse = await updateBusinessLocation({
        businessId: business.business_id,
        address: values.address,
        street_number: values.street_number,
        city: values.city,
      });

      if (locationResponse.error) {
        throw new Error(locationResponse.message);
      }

      // Close the dialog on success with a message
      onClose(true, "פרטי העסק עודכנו בהצלחה");
    } catch (err) {
      console.error("Failed to update business details:", err);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון פרטי העסק");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A365D]">שם העסק</FormLabel>
              <FormControl>
                <Input placeholder="הזן את שם העסק" className="border-sky-200 focus:border-sky-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A365D]">פרטי העסק</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="הזן תיאור של העסק"
                  className="border-sky-200 focus:border-sky-500 min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A365D]">מספר טלפון</FormLabel>
              <FormControl>
                <Input placeholder="הזן מספר טלפון" className="border-sky-200 focus:border-sky-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A365D]">סוג העסק</FormLabel>
              <FormControl>
                <Input placeholder="הזן את סוג העסק" className="border-sky-200 focus:border-sky-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-[#1A365D]">רחוב</FormLabel>
                <FormControl>
                  <Input placeholder="הזן את שם הרחוב" className="border-sky-200 focus:border-sky-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A365D]">מספר</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="מספר"
                    className="border-sky-200 focus:border-sky-500"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A365D]">עיר</FormLabel>
              <FormControl>
                <Input placeholder="הזן את שם העיר" className="border-sky-200 focus:border-sky-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Update the form buttons to show loading state and error */}
        <div className="flex flex-col space-y-2">
          {error && <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">{error}</div>}
          <div className="flex justify-start gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="border-gray-300"
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button type="submit" className="bg-[#1A365D] hover:bg-[#2D4A6D]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="ml-2">שומר שינויים...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </>
              ) : (
                "שמור שינויים"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
