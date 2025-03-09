"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { searchCities, searchStreets, getCoordinates } from "@/services/govmap-service";
import { getRegions } from "@/services/lookup-service";
import { toast } from "sonner";
import type { FormData } from "@/lib/schemaCreateBusiness";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export function Step2Location() {
  const form = useFormContext<FormData>();

  const city = form.watch("location.city");
  const street = form.watch("location.address");
  const region = form.watch("location.region");
  const streetNumber = form.watch("location.street_number");

  const [cityInput, setCityInput] = useState(city || "");
  const [streetInput, setStreetInput] = useState(street || "");
  const [regionInput, setRegionInput] = useState(region || "");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [regionSuggestions, setRegionSuggestions] = useState<string[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingStreet, setIsLoadingStreet] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(!!city);
  const [isStreetSelected, setIsStreetSelected] = useState(!!street);
  const [isRegionSelected, setIsRegionSelected] = useState(!!region);

  // Create refs for the dropdown containers
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const streetDropdownRef = useRef<HTMLDivElement>(null);
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  // Create refs for input elements
  const cityInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const regionInputRef = useRef<HTMLInputElement>(null);

  // Create handlers for outside clicks
  const handleCityOutsideClick = useCallback(() => {
    setShowCitySuggestions(false);
  }, []);

  const handleStreetOutsideClick = useCallback(() => {
    setShowStreetSuggestions(false);
  }, []);

  const handleRegionOutsideClick = useCallback(() => {
    setShowRegionSuggestions(false);
  }, []);

  // Use your custom hook for all dropdowns
  useOnClickOutside(cityDropdownRef, handleCityOutsideClick);
  useOnClickOutside(streetDropdownRef, handleStreetOutsideClick);
  useOnClickOutside(regionDropdownRef, handleRegionOutsideClick);

  // Sync input states with form values when they change externally
  useEffect(() => {
    setCityInput(city || "");
    setIsCitySelected(!!city);
  }, [city]);

  useEffect(() => {
    setStreetInput(street || "");
    setIsStreetSelected(!!street);
  }, [street]);

  useEffect(() => {
    setRegionInput(region || "");
    setIsRegionSelected(!!region);
  }, [region]);

  // Close all dropdowns when component mounts or remounts
  useEffect(() => {
    setShowCitySuggestions(false);
    setShowStreetSuggestions(false);
    setShowRegionSuggestions(false);
  }, []);

  const updateCoordinates = useCallback(async () => {
    if (!city || !street || !streetNumber) {
      return;
    }

    try {
      const coordinates = await getCoordinates(street, city, streetNumber);

      if (coordinates?.longitude && coordinates?.latitude) {
        form.setValue("location.latitude", coordinates.latitude);
        form.setValue("location.longitude", coordinates.longitude);
      }
    } catch (error) {
      console.error("Error updating coordinates:", error);
      toast.error("שגיאה בקבלת קואורדינטות למיקום");
    }
  }, [city, street, streetNumber, form]);

  // Fetch all regions once when component mounts
  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true);
      try {
        const regions = await getRegions();
        setAllRegions(regions);
        setRegionSuggestions(regions);
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("שגיאה בטעינת רשימת האזורים");
      } finally {
        setIsLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // Filter regions based on input
  useEffect(() => {
    if (regionInput === "" && !isRegionSelected) {
      setRegionSuggestions(allRegions);
      return;
    }

    const filteredRegions = allRegions.filter((region) => region.toLowerCase().includes(regionInput.toLowerCase()));

    setRegionSuggestions(filteredRegions);

    // Show suggestions when typing
    if (document.activeElement === regionInputRef.current && filteredRegions.length > 0) {
      setShowRegionSuggestions(true);
    } else if (filteredRegions.length === 0) {
      setShowRegionSuggestions(false);
    }
  }, [regionInput, allRegions, isRegionSelected]);

  // Search cities
  useEffect(() => {
    if (cityInput === "" && !isCitySelected) {
      setCitySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingCity(true);
      try {
        const cities = await searchCities(cityInput);
        setCitySuggestions(cities);

        // Show suggestions when typing
        if (document.activeElement === cityInputRef.current && cities.length > 0) {
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
  }, [cityInput, isCitySelected]);

  // Search streets
  useEffect(() => {
    if ((streetInput === "" && !isStreetSelected) || !city) {
      setStreetSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingStreet(true);
      try {
        const streets = await searchStreets(streetInput, city);
        setStreetSuggestions(streets);

        // Show suggestions when typing
        if (document.activeElement === streetInputRef.current && streets.length > 0) {
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
  }, [streetInput, city, isStreetSelected]);

  useEffect(() => {
    if (city && street && streetNumber) {
      const timer = setTimeout(() => {
        updateCoordinates();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [streetNumber, city, street, updateCoordinates]);

  // Handlers for input changes
  const handleRegionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegionInput(value);
    setIsRegionSelected(false);

    if (value === "") {
      form.setValue("location.region", "");
    }

    // Open suggestions dropdown when typing
    if (value !== "" && allRegions.length > 0) {
      setShowRegionSuggestions(true);
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    setIsCitySelected(false);

    if (value === "") {
      form.setValue("location.city", "");
    }

    // Open suggestions dropdown when typing
    if (value !== "") {
      setShowCitySuggestions(true);
    }
  };

  const handleStreetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStreetInput(value);
    setIsStreetSelected(false);

    if (value === "") {
      form.setValue("location.address", "");
    }

    form.setValue("location.latitude", undefined);
    form.setValue("location.longitude", undefined);

    // Open suggestions dropdown when typing
    if (value !== "" && city) {
      setShowStreetSuggestions(true);
    }
  };

  if (!form) return null;

  return (
    <div className="space-y-6">
      <div id="hidden-map" style={{ display: "none", height: "1px", width: "1px" }} />

      <h2 className="text-2xl font-semibold text-sky-800">מיקום העסק</h2>

      <div className="relative" ref={regionDropdownRef}>
        <FormField
          control={form.control}
          name="location.region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אזור</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    ref={regionInputRef}
                    placeholder="בחר אזור..."
                    value={regionInput}
                    onChange={handleRegionInputChange}
                    onFocus={() => {
                      // Show suggestions on focus if there's input or we have regions to show
                      if (regionInput !== "" || (allRegions.length > 0 && !isRegionSelected)) {
                        setShowRegionSuggestions(true);
                      }
                      // Close the other dropdowns
                      setShowCitySuggestions(false);
                      setShowStreetSuggestions(false);
                    }}
                    className="text-right"
                  />
                  {isLoadingRegions && (
                    <Loader2 className="absolute left-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {showRegionSuggestions && regionSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white rounded-md border shadow-lg mt-1">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {regionSuggestions.map((regionOption) => (
                          <CommandItem
                            key={regionOption}
                            onSelect={() => {
                              field.onChange(regionOption);
                              setRegionInput(regionOption);
                              setIsRegionSelected(true);
                              setShowRegionSuggestions(false);
                            }}
                            className="text-right"
                          >
                            {regionOption}
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
                    placeholder="הקלד שם עיר..."
                    value={cityInput}
                    onChange={handleCityInputChange}
                    onFocus={() => {
                      // Show suggestions on focus if there's input
                      if (cityInput !== "" && !isCitySelected) {
                        setShowCitySuggestions(true);
                      }
                      // Close the other dropdowns
                      setShowStreetSuggestions(false);
                      setShowRegionSuggestions(false);
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
                        {citySuggestions.map((cityOption) => (
                          <CommandItem
                            key={cityOption}
                            onSelect={() => {
                              field.onChange(cityOption);
                              setCityInput(cityOption);
                              setIsCitySelected(true);
                              setShowCitySuggestions(false);
                              // Reset street when city changes
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
                    placeholder="הקלד שם רחוב..."
                    value={streetInput}
                    onChange={handleStreetInputChange}
                    onFocus={() => {
                      // Show suggestions on focus if there's input, city selected, and results
                      if (streetInput !== "" && city && !isStreetSelected) {
                        setShowStreetSuggestions(true);
                      }
                      // Close the other dropdowns
                      setShowCitySuggestions(false);
                      setShowRegionSuggestions(false);
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
                        {streetSuggestions.map((streetOption) => (
                          <CommandItem
                            key={streetOption}
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
