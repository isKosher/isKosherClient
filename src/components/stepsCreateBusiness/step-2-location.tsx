"use client";

import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormData } from "@/lib/schemaCreateBusiness";
import { getCitiesByArea, getStreetsByCity } from "@/services/location-service";
import { regions } from "@/data/staticData";

export function Step2Location() {
  const form = useFormContext<FormData>();
  const [areaOpen, setAreaOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [streets, setStreets] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingStreets, setIsLoadingStreets] = useState(false);

  const selectedArea = form.watch("location.area");
  const selectedCity = form.watch("location.city");

  // Fetch cities when area changes
  useEffect(() => {
    if (selectedArea?.id) {
      setIsLoadingCities(true);
      getCitiesByArea(selectedArea.id)
        .then(setCities)
        .finally(() => setIsLoadingCities(false));
    }
  }, [selectedArea?.id]);

  // Fetch streets when city changes
  useEffect(() => {
    if (selectedCity) {
      setIsLoadingStreets(true);
      getStreetsByCity(selectedCity)
        .then(setStreets)
        .finally(() => setIsLoadingStreets(false));
    }
  }, [selectedCity]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-800">מיקום העסק</h2>

      {/* Area Selection */}
      <FormField
        control={form.control}
        name="location.area"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>אזור</FormLabel>
            <Popover open={areaOpen} onOpenChange={setAreaOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between text-right",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value?.name || "בחר אזור"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <Command>
                  <CommandInput placeholder="חפש אזור..." className="text-right" />
                  <CommandList>
                    <CommandEmpty>לא נמצאו תוצאות.</CommandEmpty>
                    <CommandGroup>
                      {regions.map((area) => (
                        <CommandItem
                          key={area.id}
                          value={area.name}
                          onSelect={() => {
                            form.setValue("location.area", area);
                            form.setValue("location.city", ""); // Reset city when area changes
                            form.setValue("location.address", ""); // Reset street when area changes
                            setAreaOpen(false);
                          }}
                          className="text-right"
                        >
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              area.id === field.value?.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {area.name}
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

      {/* City Selection */}
      <FormField
        control={form.control}
        name="location.city"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>עיר</FormLabel>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between text-right",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={!selectedArea || isLoadingCities}
                  >
                    {isLoadingCities ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>טוען ערים...</span>
                      </div>
                    ) : (
                      field.value || "בחר עיר"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <Command>
                  <CommandInput placeholder="חפש עיר..." className="text-right" />
                  <CommandList>
                    <CommandEmpty>לא נמצאו תוצאות.</CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={() => {
                            form.setValue("location.city", city);
                            form.setValue("location.address", ""); // Reset street when city changes
                            setCityOpen(false);
                          }}
                          className="text-right"
                        >
                          <Check
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

      {/* Street Selection */}
      <FormField
        control={form.control}
        name="location.address"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>רחוב</FormLabel>
            <Popover open={streetOpen} onOpenChange={setStreetOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between text-right",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={!selectedCity || isLoadingStreets}
                  >
                    {isLoadingStreets ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>טוען רחובות...</span>
                      </div>
                    ) : (
                      field.value || "בחר רחוב"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <Command>
                  <CommandInput placeholder="חפש רחוב..." className="text-right" />
                  <CommandList>
                    <CommandEmpty>לא נמצאו תוצאות.</CommandEmpty>
                    <CommandGroup>
                      {streets.map((street) => (
                        <CommandItem
                          key={street}
                          value={street}
                          onSelect={() => {
                            form.setValue("location.address", street);
                            setStreetOpen(false);
                          }}
                          className="text-right"
                        >
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              street === field.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {street}
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

      {/* Street Number */}
      <FormField
        control={form.control}
        name="location.street_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מספר בית</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                disabled={!form.watch("location.address")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Additional Location Details */}
      <FormField
        control={form.control}
        name="location.location_details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>פרטים נוספים על המיקום</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="כניסה, קומה, או הוראות הגעה נוספות"
                className="border-sky-200 focus:border-sky-500 transition-all duration-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
