"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { UserOwnedBusinessResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { getCoordinates } from "@/services/govmap-service";
import { updateBusinessDetails, updateBusinessLocation } from "@/app/actions/dashboardAction";

const formSchema = z.object({
  business_name: z.string().min(2, { message: "שם העסק חייב להכיל לפחות 2 תווים" }),
  business_details: z.string().min(10, { message: "פרטי העסק חייבים להכיל לפחות 10 תווים" }),
  business_number: z.string().min(9, { message: "מספר טלפון לא תקין" }),
  business_type: z.string().min(2, { message: "סוג העסק חייב להכיל לפחות 2 תווים" }),
  address: z.string().min(2, { message: "כתובת חייבת להכיל לפחות 2 תווים" }),
  street_number: z.number().min(1, { message: "מספר רחוב חייב להיות לפחות 1" }),
  city: z.string().min(2, { message: "עיר חייבת להכיל לפחות 2 תווים" }),
  location_details: z.string().min(2, { message: "פרטי מיקום חייבים להכיל לפחות 2 תווים" }),
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
      location_details: business.location.location_details || "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);

      const businessDetailsChanged =
        values.business_name !== business.business_name ||
        values.business_details !== business.business_details ||
        values.business_number !== business.business_number ||
        values.business_type !== business.business_type;

      const locationChanged =
        values.address !== business.location.address ||
        values.street_number !== business.location.street_number ||
        values.city !== business.location.city ||
        values.location_details !== (business.location.location_details || "");

      if (!businessDetailsChanged && !locationChanged) {
        onClose(false, "לא נמצאו שינויים לעדכון");
        return;
      }

      // Check if address changed to get new coordinates
      const addressChanged =
        values.address !== business.location.address ||
        values.street_number !== business.location.street_number ||
        values.city !== business.location.city;

      let coordinates = {
        latitude: business.location.latitude,
        longitude: business.location.longitude,
      };

      if (addressChanged) {
        // Get new coordinates if address changed
        const newCoordinates = await getCoordinates(values.address, values.city, values.street_number);

        if (newCoordinates?.longitude && newCoordinates?.latitude) {
          coordinates = {
            latitude: newCoordinates.latitude || business.location.latitude,
            longitude: newCoordinates.longitude || business.location.longitude,
          };
        }
      }

      const updatePromises = [];

      if (businessDetailsChanged) {
        updatePromises.push(
          updateBusinessDetails({
            business_id: business.business_id,
            business_name: values.business_name,
            business_details: values.business_details,
            business_phone: values.business_number,
            business_type: values.business_type,
          })
        );
      }

      updatePromises.push(
        updateBusinessLocation({
          business_id: business.business_id,
          location: {
            street_number: values.street_number,
            address: values.address,
            city: values.city,
            region: business.location.region,
            longitude: coordinates.longitude,
            latitude: coordinates.latitude,
            location_details: values.location_details,
          },
        })
      );
      console.log(`Running ${updatePromises.length} update operations...`);
      const results = await Promise.all(updatePromises);

      const failedUpdates = results.filter((result) => !result);
      if (failedUpdates.length > 0) {
        throw new Error("חלק מהעדכונים נכשלו");
      }

      let successMessage = "עודכן בהצלחה: ";
      const updatedItems = [];

      if (businessDetailsChanged) updatedItems.push("פרטי העסק");
      if (locationChanged) updatedItems.push("מיקום העסק");

      successMessage += updatedItems.join(" ו");

      onClose(true, successMessage);
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
                  className="border-sky-200 focus:border-sky-500 min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

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

        <FormField
          control={form.control}
          name="location_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A365D]">פרטי מיקום</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="הזן פרטי מיקום נוספים"
                  className="border-sky-200 focus:border-sky-500 min-h-[60px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
