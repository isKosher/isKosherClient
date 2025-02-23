"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormData } from "@/lib/schemaCreateBusiness";

export function Step4Supervision() {
  const { control } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-800">פיקוח וכשרות</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="supervisor.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם המשגיח</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="supervisor.contact_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>פרטי התקשרות</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="supervisor.authority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>רשות הפיקוח</FormLabel>
            <FormControl>
              <Input {...field} className="border-sky-200 focus:border-sky-500 transition-all duration-300" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="kosher_certificate.certificate"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>אישור כשרות</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => onChange(e.target.files?.[0])}
                className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="kosher_certificate.expiration_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>תאריך תפוגת תעודה</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal border-sky-200 focus:border-sky-500",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>בחר תאריך</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date() || date > new Date("2100-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
