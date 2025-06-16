"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { UserOwnedBusinessResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback } from "react";
import { getCoordinates, searchCities, searchStreets, getCityRegion } from "@/services/geoapify-service";
import { updateBusinessDetails, updateBusinessLocation } from "@/app/actions/dashboardAction";
import { useLookupData } from "@/contexts/lookup-context";
import SelectWithAdd from "@/components/select-with-add";

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
  const { businessTypes, addCustomBusinessType, isLoading: lookupLoading } = useLookupData();

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

  // States for autocomplete
  const [citySearchResults, setCitySearchResults] = useState<string[]>([]);
  const [streetSearchResults, setStreetSearchResults] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [isSearchingStreets, setIsSearchingStreets] = useState(false);

  const handleAddCustomBusinessType = (name: string) => {
    addCustomBusinessType(name);
    form.setValue("business_type", name);
  };

  // Debounced city search
  const debouncedCitySearch = useCallback(
    debounce(async (keyword: string) => {
      if (keyword.length < 2) {
        setCitySearchResults([]);
        return;
      }

      setIsSearchingCities(true);
      try {
        const results = await searchCities(keyword);
        setCitySearchResults(results);
      } catch (error) {
        console.error("Failed to search cities:", error);
        setCitySearchResults([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 300),
    []
  );

  // Debounced street search
  const debouncedStreetSearch = useCallback(
    debounce(async (streetKeyword: string, city: string) => {
      if (streetKeyword.length < 2 || city.length < 2) {
        setStreetSearchResults([]);
        return;
      }

      setIsSearchingStreets(true);
      try {
        const results = await searchStreets(streetKeyword, city);
        setStreetSearchResults(results);
      } catch (error) {
        console.error("Failed to search streets:", error);
        setStreetSearchResults([]);
      } finally {
        setIsSearchingStreets(false);
      }
    }, 300),
    []
  );

  // Handle city input change
  const handleCityInputChange = (value: string) => {
    form.setValue("city", value);
    debouncedCitySearch(value);
    setShowCitySuggestions(true);

    // Clear street suggestions when city changes
    setStreetSearchResults([]);
  };

  // Handle street input change
  const handleStreetInputChange = (value: string) => {
    form.setValue("address", value);
    const currentCity = form.getValues("city");
    if (currentCity) {
      debouncedStreetSearch(value, currentCity);
      setShowStreetSuggestions(true);
    }
  };

  // Select city from suggestions
  const selectCity = (city: string) => {
    form.setValue("city", city);
    setShowCitySuggestions(false);
    setCitySearchResults([]);
  };

  // Select street from suggestions
  const selectStreet = (street: string) => {
    form.setValue("address", street);
    setShowStreetSuggestions(false);
    setStreetSearchResults([]);
  };

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

      // Check if address or city changed
      const addressChanged =
        values.address !== business.location.address ||
        values.street_number !== business.location.street_number ||
        values.city !== business.location.city;

      const cityChanged = values.city !== business.location.city;

      let coordinates = {
        latitude: business.location.latitude,
        longitude: business.location.longitude,
      };

      let region = business.location.region;

      // Get new coordinates if address changed
      if (addressChanged) {
        const newCoordinates = await getCoordinates(values.address, values.city, values.street_number);

        if (newCoordinates?.longitude && newCoordinates?.latitude) {
          coordinates = {
            latitude: newCoordinates.latitude || business.location.latitude,
            longitude: newCoordinates.longitude || business.location.longitude,
          };
        }
      }

      // Get new region if city changed
      if (cityChanged) {
        try {
          const newRegion = await getCityRegion(values.city);
          if (newRegion) {
            region = newRegion;
          }
        } catch (error) {
          console.warn(`Failed to get region for city "${values.city}":`, error);
          // Keep the original region if fetching fails
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
            region: region,
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
                  {lookupLoading ? (
                    <div className="p-2 text-center text-gray-500">טוען סוגי עסקים...</div>
                  ) : (
                    <SelectWithAdd
                      options={businessTypes}
                      value={field.value}
                      onChange={field.onChange}
                      onAddCustom={handleAddCustomBusinessType}
                      placeholder="בחר או הוסף סוג עסק"
                      allowCustom={true}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* City field with autocomplete */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel className="text-[#1A365D]">עיר</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="הזן את שם העיר"
                    className="border-sky-200 focus:border-sky-500"
                    value={field.value}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    onFocus={() => {
                      if (citySearchResults.length > 0) {
                        setShowCitySuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow for selection
                      setTimeout(() => setShowCitySuggestions(false), 200);
                    }}
                  />
                  {isSearchingCities && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </FormControl>

              {/* City suggestions dropdown */}
              {showCitySuggestions && citySearchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {citySearchResults.map((city, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-right"
                      onClick={() => selectCity(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address fields with street autocomplete */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2 relative">
                <FormLabel className="text-[#1A365D]">רחוב</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="הזן את שם הרחוב"
                      className="border-sky-200 focus:border-sky-500"
                      value={field.value}
                      onChange={(e) => handleStreetInputChange(e.target.value)}
                      onFocus={() => {
                        if (streetSearchResults.length > 0) {
                          setShowStreetSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow for selection
                        setTimeout(() => setShowStreetSuggestions(false), 200);
                      }}
                    />
                    {isSearchingStreets && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </FormControl>

                {/* Street suggestions dropdown */}
                {showStreetSuggestions && streetSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {streetSearchResults.map((street, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-right"
                        onClick={() => selectStreet(street)}
                      >
                        {street}
                      </div>
                    ))}
                  </div>
                )}
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

/**
 * Creates a debounced version of the provided function that delays its execution until after a specified wait time has elapsed
 * since the last time it was invoked. Useful for limiting the rate at which a function can fire, such as handling user input events.
 *
 * @template T - The type of the function to debounce.
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to delay.
 * @returns A debounced version of the input function.
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}
