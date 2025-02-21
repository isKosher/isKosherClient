"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/from";
import { useState } from "react";
import { FormData } from "@/lib/schemaCreateBusiness";

export function Step1BusinessDetails() {
  const form = useFormContext<FormData>();
  const [descriptionLength, setDescriptionLength] = useState(0);

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-800">פרטי העסק</h2>
      <FormField
        control={form.control}
        name="business_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>שם העסק</FormLabel>
            <FormControl>
              <Input
                placeholder="הכנס את שם העסק"
                {...field}
                className="border-sky-200 focus:border-sky-500 transition-all duration-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="business_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>טלפון העסק</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="הכנס את מספר הטלפון"
                {...field}
                className="border-sky-200 focus:border-sky-500 transition-all duration-300"
              />
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
            <FormLabel>תיאור העסק</FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  placeholder="הכנס פרטים על העסק"
                  {...field}
                  className="border-sky-200 focus:border-sky-500 transition-all duration-300 min-h-[100px]"
                  onChange={(e) => {
                    field.onChange(e);
                    setDescriptionLength(e.target.value.length);
                  }}
                  maxLength={500}
                />
                <span className="absolute bottom-2 right-2 text-sm text-gray-500">
                  {descriptionLength}/500
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
