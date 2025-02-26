"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { searchCities, searchStreets } from "@/services/govmap-service";
import { toast } from "sonner";
import type { FormData } from "@/lib/schemaCreateBusiness";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export function Step2Location() {
  const form = useFormContext<FormData>();
  const [cityInput, setCityInput] = useState("");
  const [streetInput, setStreetInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingStreet, setIsLoadingStreet] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);

  // Create refs for the dropdown containers
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const streetDropdownRef = useRef<HTMLDivElement>(null);

  const city = form.watch("location.city");

  // Create handlers for outside clicks
  const handleCityOutsideClick = useCallback(() => {
    setShowCitySuggestions(false);
  }, []);

  const handleStreetOutsideClick = useCallback(() => {
    setShowStreetSuggestions(false);
  }, []);

  // Use your custom hook for both dropdowns
  useOnClickOutside(cityDropdownRef, handleCityOutsideClick);
  useOnClickOutside(streetDropdownRef, handleStreetOutsideClick);

  // Search cities
  useEffect(() => {
    if (!cityInput) {
      setCitySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingCity(true);
      try {
        const cities = await searchCities(cityInput);
        setCitySuggestions(cities);
        if (cities.length > 0) {
          setShowCitySuggestions(true);
        }
      } catch (error) {
        console.error("Error searching cities:", error);
        toast.error("שגיאה בחיפוש ערים");
      } finally {
        setIsLoadingCity(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cityInput]);

  // Search streets
  useEffect(() => {
    if (!streetInput || !city) {
      setStreetSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingStreet(true);
      try {
        const streets = await searchStreets(streetInput, city);
        setStreetSuggestions(streets);
        if (streets.length > 0) {
          setShowStreetSuggestions(true);
        }
      } catch (error) {
        console.error("Error searching streets:", error);
        toast.error("שגיאה בחיפוש רחובות");
      } finally {
        setIsLoadingStreet(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [streetInput, city]);

  if (!form) return null;

  return (
    <div className="space-y-6">
      <div id="hidden-map" style={{ display: "none", height: "1px", width: "1px" }} />

      <h2 className="text-2xl font-semibold text-sky-800">מיקום העסק</h2>

      <div className="relative" ref={cityDropdownRef}>
        <FormField
          control={form.control}
          name="location.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>עיר</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="הקלד שם עיר..."
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value);
                      field.onChange("");
                    }}
                    onFocus={() => {
                      setShowCitySuggestions(citySuggestions.length > 0);
                      // Close the other dropdown when focusing on this one
                      setShowStreetSuggestions(false);
                    }}
                    className="text-right"
                  />
                  {isLoadingCity && (
                    <Loader2 className="absolute left-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white rounded-md border shadow-lg mt-1">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {citySuggestions.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => {
                              field.onChange(city);
                              setCityInput(city);
                              setShowCitySuggestions(false);
                              // Reset street when city changes
                              form.setValue("location.address", "");
                              setStreetInput("");
                            }}
                            className="text-right"
                          >
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="relative" ref={streetDropdownRef}>
        <FormField
          control={form.control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>רחוב</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="הקלד שם רחוב..."
                    value={streetInput}
                    onChange={(e) => {
                      setStreetInput(e.target.value);
                      field.onChange("");
                    }}
                    onFocus={() => {
                      if (city) {
                        setShowStreetSuggestions(streetSuggestions.length > 0);
                        // Close the other dropdown when focusing on this one
                        setShowCitySuggestions(false);
                      }
                    }}
                    className="text-right"
                    disabled={!form.watch("location.city")}
                  />
                  {isLoadingStreet && (
                    <Loader2 className="absolute left-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {showStreetSuggestions && streetSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white rounded-md border shadow-lg mt-1">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {streetSuggestions.map((street) => (
                          <CommandItem
                            key={street}
                            onSelect={() => {
                              field.onChange(street);
                              setStreetInput(street);
                              setShowStreetSuggestions(false);
                            }}
                            className="text-right"
                          >
                            {street}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="location.street_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מספר בית</FormLabel>
            <FormControl>
              <Input
                placeholder="הקלד מספר רחוב..."
                type="number"
                value={field.value || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="text-right"
                disabled={!form.watch("location.address")}
              />
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
            <FormLabel>פרטים נוספים על המיקום</FormLabel>
            <FormControl>
              <Input {...field} placeholder="כניסה, קומה, או הוראות הגעה נוספות" className="text-right" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
