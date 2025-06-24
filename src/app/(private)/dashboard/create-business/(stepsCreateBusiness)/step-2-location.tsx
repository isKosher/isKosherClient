"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FormData } from "@/lib/schemaCreateBusiness";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { getCityRegion, getCoordinates, searchCities, searchStreets } from "@/services/geoapify-service";

export function Step2Location() {
  const form = useFormContext<FormData>();

  const city = form.watch("location.city");
  const street = form.watch("location.address");
  const streetNumber = form.watch("location.street_number");

  const [cityInput, setCityInput] = useState(city || "");
  const [streetInput, setStreetInput] = useState(street || "");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingStreet, setIsLoadingStreet] = useState(false);
  const [isLoadingRegion, setIsLoadingRegion] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(!!city);
  const [isStreetSelected, setIsStreetSelected] = useState(!!street);

  // Track the last processed city to prevent duplicate API calls
  const lastProcessedCityRef = useRef<string>("");

  // Create refs for the dropdown containers
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const streetDropdownRef = useRef<HTMLDivElement>(null);

  // Create refs for input elements
  const cityInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);

  // Stable handlers for outside clicks
  const handleCityOutsideClick = useCallback(() => {
    setShowCitySuggestions(false);
  }, []);

  const handleStreetOutsideClick = useCallback(() => {
    setShowStreetSuggestions(false);
  }, []);

  // Use your custom hook for dropdowns
  useOnClickOutside(cityDropdownRef, handleCityOutsideClick);
  useOnClickOutside(streetDropdownRef, handleStreetOutsideClick);

  // Sync input states with form values when they change externally (only once)
  useEffect(() => {
    if (city !== cityInput) {
      setCityInput(city || "");
      setIsCitySelected(!!city);
    }
  }, [city]); // Remove cityInput from dependencies to prevent loops

  useEffect(() => {
    if (street !== streetInput) {
      setStreetInput(street || "");
      setIsStreetSelected(!!street);
    }
  }, [street]); // Remove streetInput from dependencies to prevent loops

  // Close all dropdowns when component mounts (only once)
  useEffect(() => {
    setShowCitySuggestions(false);
    setShowStreetSuggestions(false);
  }, []); // Empty dependency array

  // Update region when city changes - prevent duplicate calls
  useEffect(() => {
    const updateRegionForCity = async (selectedCity: string) => {
      // Prevent duplicate API calls
      if (lastProcessedCityRef.current === selectedCity) {
        return;
      }

      lastProcessedCityRef.current = selectedCity;

      if (!selectedCity) {
        form.setValue("location.region", "");
        return;
      }

      setIsLoadingRegion(true);
      try {
        const region = await getCityRegion(selectedCity);
        if (region) {
          form.setValue("location.region", region);
        } else {
          form.setValue("location.region", "");
          console.warn(`No region found for city: ${selectedCity}`);
        }
      } catch (error) {
        console.error("Error getting region for city:", error);
        toast.error("שגיאה בקבלת האזור לעיר");
        form.setValue("location.region", "");
      } finally {
        setIsLoadingRegion(false);
      }
    };

    if (city && isCitySelected) {
      updateRegionForCity(city);
    } else if (!city) {
      lastProcessedCityRef.current = "";
    }
  }, [city, isCitySelected]); // Minimal dependencies

  // Stable updateCoordinates function
  const updateCoordinates = useCallback(async () => {
    if (!city || !street) {
      return;
    }

    try {
      const coordinates = await getCoordinates(street, city, streetNumber);

      if (coordinates?.longitude && coordinates?.latitude) {
        form.setValue("location.latitude", coordinates.latitude);
        form.setValue("location.longitude", coordinates.longitude);
      } else {
        form.setValue("location.latitude", undefined);
        form.setValue("location.longitude", undefined);
      }
    } catch (error) {
      console.error("Error updating coordinates:", error);
      toast.error("שגיאה בקבלת קואורדינטות למיקום");
      form.setValue("location.latitude", undefined);
      form.setValue("location.longitude", undefined);
    }
  }, [city, street, streetNumber]); // Remove form from dependencies

  // Search cities with debouncing - prevent duplicate searches
  useEffect(() => {
    if (cityInput === "" && !isCitySelected) {
      setCitySuggestions([]);
      return;
    }

    if (cityInput.length < 2) {
      setCitySuggestions([]);
      return;
    }

    // Don't search if city is already selected and input matches
    if (isCitySelected && cityInput === city) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingCity(true);
      try {
        const cities = await searchCities(cityInput);
        setCitySuggestions(cities);

        // Show suggestions when typing and input is focused
        if (document.activeElement === cityInputRef.current && cities.length > 0) {
          setShowCitySuggestions(true);
        }
      } catch (error) {
        console.error("Error searching cities:", error);
        toast.error("שגיאה בחיפוש ערים");
        setCitySuggestions([]);
      } finally {
        setIsLoadingCity(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cityInput, isCitySelected, city]); // Add city to prevent unnecessary searches

  // Search streets with debouncing - prevent duplicate searches
  useEffect(() => {
    if ((streetInput === "" && !isStreetSelected) || !city) {
      setStreetSuggestions([]);
      return;
    }

    if (streetInput.length < 2) {
      setStreetSuggestions([]);
      return;
    }

    // Don't search if street is already selected and input matches
    if (isStreetSelected && streetInput === street) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingStreet(true);
      try {
        const streets = await searchStreets(streetInput, city);
        setStreetSuggestions(streets);

        // Show suggestions when typing and input is focused
        if (document.activeElement === streetInputRef.current && streets.length > 0) {
          setShowStreetSuggestions(true);
        }
      } catch (error) {
        console.error("Error searching streets:", error);
        toast.error("שגיאה בחיפוש רחובות");
        setStreetSuggestions([]);
      } finally {
        setIsLoadingStreet(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [streetInput, city, isStreetSelected, street]); // Add street to prevent unnecessary searches

  // Update coordinates when address details change - with better debouncing
  useEffect(() => {
    if (city && street) {
      const timer = setTimeout(() => {
        updateCoordinates();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [updateCoordinates]); // Use the stable function reference

  // Stable handlers for input changes
  const handleCityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    setIsCitySelected(false);

    if (value === "") {
      form.setValue("location.city", "");
      form.setValue("location.region", "");
      form.setValue("location.address", "");
      setStreetInput("");
      setIsStreetSelected(false);
      form.setValue("location.latitude", undefined);
      form.setValue("location.longitude", undefined);
      lastProcessedCityRef.current = "";
    }

    if (value !== "" && value.length >= 2) {
      setShowCitySuggestions(true);
    }
  }, []); // No dependencies needed

  const handleStreetInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setStreetInput(value);
      setIsStreetSelected(false);

      if (value === "") {
        form.setValue("location.address", "");
      }

      form.setValue("location.latitude", undefined);
      form.setValue("location.longitude", undefined);

      if (value !== "" && city && value.length >= 2) {
        setShowStreetSuggestions(true);
      }
    },
    [city]
  ); // Only city as dependency

  if (!form) return null;

  return (
    <div className="space-y-6">
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
                    ref={cityInputRef}
                    placeholder="הקלד שם עיר (לפחות 2 תווים)..."
                    value={cityInput}
                    onChange={handleCityInputChange}
                    onFocus={() => {
                      if (cityInput !== "" && cityInput.length >= 2 && !isCitySelected) {
                        setShowCitySuggestions(true);
                      }
                      setShowStreetSuggestions(false);
                    }}
                    className="text-right"
                  />
                  {(isLoadingCity || isLoadingRegion) && (
                    <Loader2 className="absolute left-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white rounded-md border shadow-lg mt-1">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {citySuggestions.map((cityOption) => (
                          <CommandItem
                            key={cityOption}
                            onSelect={() => {
                              field.onChange(cityOption);
                              setCityInput(cityOption);
                              setIsCitySelected(true);
                              setShowCitySuggestions(false);
                              // Reset dependent fields
                              form.setValue("location.address", "");
                              setStreetInput("");
                              setIsStreetSelected(false);
                              form.setValue("location.latitude", undefined);
                              form.setValue("location.longitude", undefined);
                            }}
                            className="text-right"
                          >
                            {cityOption}
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
                    ref={streetInputRef}
                    placeholder="הקלד שם רחוב (לפחות 2 תווים)..."
                    value={streetInput}
                    onChange={handleStreetInputChange}
                    onFocus={() => {
                      if (streetInput !== "" && streetInput.length >= 2 && city && !isStreetSelected) {
                        setShowStreetSuggestions(true);
                      }
                      setShowCitySuggestions(false);
                    }}
                    className="text-right"
                    disabled={!city}
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
                        {streetSuggestions.map((streetOption, index) => (
                          <CommandItem
                            key={`${streetOption}-${index}`}
                            onSelect={() => {
                              field.onChange(streetOption);
                              setStreetInput(streetOption);
                              setIsStreetSelected(true);
                              setShowStreetSuggestions(false);
                              form.setValue("location.latitude", undefined);
                              form.setValue("location.longitude", undefined);
                            }}
                            className="text-right"
                          >
                            {streetOption}
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
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                  form.setValue("location.latitude", undefined);
                  form.setValue("location.longitude", undefined);
                }}
                className="text-right"
                disabled={!street}
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
              <Input
                {...field}
                placeholder="כניסה, קומה, או הוראות הגעה נוספות"
                className="text-right"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
