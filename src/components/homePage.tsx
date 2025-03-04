"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import FilterDropdown from "../app/filterDropdown";
import RestaurantCard from "../app/restaurantCard";
import { cn } from "@/lib/utils";
import CityFilter from "../app/cityFilter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import GpsSearchAnimation from "@/components/gpsSearchAnimation";
import { useInView } from "react-intersection-observer";
import type { BusinessPreview } from "@/types";
import { getFilterParams, getRestaurantsAction } from "@/app/actions/getRestaurantAction";
import SearchComponent from "./search-term";
import { toast } from "sonner";
import { fetchLookupData } from "@/services/lookup-service";
import type { Option } from "@/lib/schemaCreateBusiness";
import { useRouter, useSearchParams } from "next/navigation";

// TODO: Remove foodTypes from here and props
const foodTypes = ["בשרי", "חלבי", "פרווה"];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<BusinessPreview[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedFoodType, setSelectedFoodType] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<Option[]>([]);
  const [kosherTypes, setKosherTypes] = useState<Option[]>([]);
  const [foodItems, setFoodItems] = useState<Option[]>([]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [selectedKosherTypes, setSelectedKosherTypes] = useState<string[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { ref, inView } = useInView();
  const [dataInitialized, setDataInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Check if any filters are applied
  const hasActiveFilters = useCallback(() => {
    return (
      selectedCity !== "" ||
      selectedFoodType.length > 0 ||
      selectedBusinessTypes.length > 0 ||
      selectedKosherTypes.length > 0 ||
      selectedFoodItems.length > 0
    );
  }, [selectedCity, selectedFoodType, selectedBusinessTypes, selectedKosherTypes, selectedFoodItems]);

  // Load lookup data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLookupData();

        setBusinessTypes(
          data.business_types.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );

        setKosherTypes(
          data.kosher_types.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );

        setFoodItems(
          data.food_item_types.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );

        setDataInitialized(true);
      } catch (error) {
        toast.error("שגיאה בטעינת הנתונים", {
          description: "לא ניתן לטעון את רשימת האפשרויות. אנא נסה שוב מאוחר יותר.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize filters from URL and load appropriate data - only runs once
  useEffect(() => {
    const initializeData = async () => {
      // Only run this once when data is initialized and not already loaded
      if (!dataInitialized || initialLoadComplete) return;

      setLoading(true);

      // Check if there are any filters in the URL
      const city = searchParams.get("city") || "";
      const foodTypeParams = searchParams.getAll("foodTypes");
      const businessTypeParams = searchParams.getAll("businessTypes");
      const kosherTypeParams = searchParams.getAll("kosherTypes");
      const foodItemParams = searchParams.getAll("foodItems");

      // Set the filter values from URL
      setSelectedCity(city);
      setSelectedFoodType(foodTypeParams.filter((type) => foodTypes.includes(type)));
      setSelectedBusinessTypes(businessTypeParams);
      setSelectedKosherTypes(kosherTypeParams);
      setSelectedFoodItems(foodItemParams);

      const hasUrlFilters =
        city ||
        foodTypeParams.length > 0 ||
        businessTypeParams.length > 0 ||
        kosherTypeParams.length > 0 ||
        foodItemParams.length > 0;

      try {
        if (hasUrlFilters) {
          // If we have URL filters, fetch filtered results directly
          setIsFiltering(true);
          setIsOpen(true); // Open filter panel

          const params = new URLSearchParams(searchParams.toString());
          const filteredRestaurants = await getFilterParams(params.toString());

          setRestaurants(filteredRestaurants);
          setHasMore(filteredRestaurants.length > 0);
        } else {
          // No filters, load initial data
          const initialData = await getRestaurantsAction();
          setRestaurants(initialData);
          setHasMore(initialData.length > 0);
          setIsFiltering(false);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        toast.error("שגיאה בטעינת הנתונים", {
          description: "אירעה שגיאה בטעינת הנתונים הראשוניים.",
        });

        // Fallback to empty state
        setRestaurants([]);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true); // Mark initial load as complete to prevent duplicate loads
      }
    };

    initializeData();
  }, [searchParams, dataInitialized, initialLoadComplete]);

  // Update URL based on current filters
  const updateUrl = () => {
    const params = new URLSearchParams();

    if (selectedCity) params.append("city", selectedCity.trim());

    selectedFoodType.forEach((type) => {
      params.append("foodTypes", type);
    });

    selectedBusinessTypes.forEach((type) => {
      params.append("businessTypes", type);
    });

    selectedKosherTypes.forEach((type) => {
      params.append("kosherTypes", type);
    });

    selectedFoodItems.forEach((item) => {
      params.append("foodItems", item);
    });

    // Use Next.js router to update the URL without refreshing the page
    const paramsString = params.toString();
    const newUrl = paramsString ? `?${paramsString}` : "";

    // Replace current URL with the new one
    router.replace(newUrl, { scroll: false });
  };

  const loadMore = async () => {
    // Don't load more if we're filtering or already loading
    if (isFiltering || isLoading || !hasMore) {
      return;
    }

    try {
      setIsLoading(true);
      const newRestaurants = await getRestaurantsAction(page);

      if (newRestaurants.length === 0) {
        setHasMore(false);
      } else {
        setRestaurants((prev) => [...prev, ...newRestaurants]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("שגיאה בטעינת הנתונים", {
        description: "אירעה שגיאה בטעינת מסעדות נוספות.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inView && !isLoading && hasMore && !isFiltering) {
      loadMore();
    }
  }, [inView, isLoading, hasMore, isFiltering]); // Removed loadMore to dependencies

  function handleSelectFoodType(selectedType: string) {
    setSelectedFoodType((prev) =>
      prev.includes(selectedType) ? prev.filter((type) => type !== selectedType) : [...prev, selectedType]
    );
  }

  const resetFilters = async () => {
    setSelectedCity("");
    setSelectedFoodType([]);
    setSelectedBusinessTypes([]);
    setSelectedKosherTypes([]);
    setSelectedFoodItems([]);
    setIsFiltering(false);
    setPage(2); // Reset pagination to start loading from page 2 (after initial)

    // Reset URL to remove all query parameters
    router.replace("/", { scroll: false });

    // Load initial restaurants
    try {
      setLoading(true);
      const initialData = await getRestaurantsAction();
      setRestaurants(initialData);
      setHasMore(true);
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("שגיאה בטעינת הנתונים", {
        description: "אירעה שגיאה בטעינת נתונים ראשוניים.",
      });
    } finally {
      setLoading(false);
    }

    // Optionally close the filter panel
    setIsOpen(false);
  };

  const handleSearch = async () => {
    // Don't do anything if no filters are selected
    if (!hasActiveFilters()) {
      return;
    }

    setLoading(true);

    // Update URL with current filters
    updateUrl();

    // Clear current results before searching
    setRestaurants([]);

    // Set filtering state
    setIsFiltering(true);

    try {
      const params = new URLSearchParams();

      if (selectedCity) params.append("city", selectedCity.trim());

      selectedFoodType.forEach((type) => {
        params.append("foodTypes", type);
      });

      selectedBusinessTypes.forEach((type) => {
        params.append("businessTypes", type);
      });

      selectedKosherTypes.forEach((type) => {
        params.append("kosherTypes", type);
      });

      selectedFoodItems.forEach((item) => {
        params.append("foodItems", item);
      });

      const response: BusinessPreview[] = await getFilterParams(params.toString());

      // Set filtered restaurants
      setRestaurants(response);

      // If no results or very few results, disable "load more"
      setHasMore(response.length > 0); //Corrected this line to accurately reflect hasMore state
    } catch (error) {
      console.error("Error searching restaurants:", error);
      toast.error("שגיאה בטעינת הנתונים", {
        description: "אירעה שגיאה בחיפוש. אנא נסה שנית.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAll = () => {
    if (selectedFoodType.length === foodTypes.length) {
      setSelectedFoodType([]); // Uncheck all if all are already selected
    } else {
      setSelectedFoodType([...foodTypes]); // Check all
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center">
      <div className="mx-auto px-4 py-20 bg-pattern text-sm">
        <div className="max-w-3xl mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-5xl is-kosher-font text-[#1A365D] font-bold mb-2">isKosher</h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">מצא מסעדות כשרות בסביבתך</p>
          </div>
          <SearchComponent />
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-4 mt-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                dir="rtl"
                className="w-full flex justify-between items-center p-6 text-lg font-medium
                text-[#2D4A6D] hover:bg-[#1A365D]/5 transition-all rounded-lg mt-2 mb-4"
              >
                <span>סינון תוצאות</span>
                <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="collapsible-content space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FilterDropdown
                  filterOptions={kosherTypes}
                  loading={loading}
                  filterPlaceholder="תבחר תעודת כשרות"
                  onSelectFilters={(selectedFilters) => setSelectedKosherTypes(selectedFilters)}
                  selectedFilters={selectedKosherTypes}
                />
                <FilterDropdown
                  filterOptions={foodItems}
                  loading={loading}
                  filterPlaceholder="תבחר סוג אוכל"
                  onSelectFilters={(selectedFilters) => setSelectedFoodItems(selectedFilters)}
                  selectedFilters={selectedFoodItems}
                />
                <FilterDropdown
                  filterOptions={businessTypes}
                  loading={loading}
                  filterPlaceholder="תבחר סוג עסק"
                  onSelectFilters={(selectedFilters) => setSelectedBusinessTypes(selectedFilters)}
                  selectedFilters={selectedBusinessTypes}
                />
                <div className="grid grid-cols-2 row-span-2 gap-2 w-full">
                  <Button
                    key="check-all"
                    variant="outline"
                    className="flex-1 p-4 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg h-full hebrew-side hover:bg-gray-500 hover:text-white"
                    onClick={handleCheckAll}
                    disabled={loading}
                  >
                    בחר הכל{" "}
                  </Button>
                  {foodTypes.map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      className={cn(
                        "flex-1 p-4 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg h-full hebrew-side",

                        selectedFoodType.includes(type) && {
                          "border-blue-500 ": type === "חלבי",
                          "border-red-500 ": type === "בשרי",
                          "border-green-500 ": type === "פרווה",
                        }
                      )}
                      onClick={() => handleSelectFoodType(type)}
                      disabled={loading}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <CityFilter
                  onSelectCity={(city) => setSelectedCity(city)}
                  loading={loading}
                  selectedCity={selectedCity}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center justify-center space-x-2">
            <Button
              className="w-full bg-[#1A365D] hover:bg-[#2D4A6D] text-white text-md lg:text-lg py-6 mt-4"
              onClick={handleSearch}
              disabled={loading || !hasActiveFilters()} // Disable if no filters are selected
            >
              <Search className="w-6 h-6 mr-2" />
              {loading ? "מחפש..." : "חפש"}
            </Button>

            {hasActiveFilters() && (
              <Button
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-md lg:text-lg py-6"
                onClick={resetFilters}
                disabled={loading}
              >
                <X className="w-6 h-6 mr-2" />
                נקה סינון
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-8 flex justify-center flex-col">
        {loading && (
          <div className="self-center h-60 w-60">
            <GpsSearchAnimation />
          </div>
        )}

        {restaurants.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-2xl text-gray-600">לא נמצאו תוצאות</p>
            {isFiltering && (
              <Button className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={resetFilters}>
                נקה סינון ונסה שוב
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.business_id}>
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>

        {hasMore && !isFiltering && !loading && (
          <div ref={ref} className="self-center h-60 w-60">
            <GpsSearchAnimation />
          </div>
        )}
      </div>
    </div>
  );
}
