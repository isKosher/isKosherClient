"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/from";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { cities, FormData } from "@/lib/schemaCreateBusiness";

export function Step2Location() {
  const form = useFormContext<FormData>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (!form) {
    return null;
  }

  const filteredCities = cities.filter((city) => city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-800">מיקום העסק</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="location.street_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מספר רחוב</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>כתובת</FormLabel>
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
      </div>
      <FormField
        control={form.control}
        name="location.region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>אזור</FormLabel>
            <FormControl>
              <Input {...field} className="border-sky-200 focus:border-sky-500 transition-all duration-300" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="location.location_details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>פירוט נוסף על המיקום</FormLabel>
            <FormControl>
              <Input {...field} className="border-sky-200 focus:border-sky-500 transition-all duration-300" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="location.city"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>עיר</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between text-right border-sky-200 focus:border-sky-500",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value || "בחר עיר"}
                    <CheckIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="חפש עיר..."
                    value={search}
                    onValueChange={setSearch}
                    className="text-right"
                  />
                  <CommandList>
                    <CommandEmpty>לא נמצאו תוצאות.</CommandEmpty>
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          value={city}
                          key={city}
                          onSelect={() => {
                            field.onChange(city);
                            setOpen(false);
                          }}
                          className="text-right"
                        >
                          <CheckIcon
                            className={cn("ml-2 h-4 w-4", city === field.value ? "opacity-100" : "opacity-0")}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
