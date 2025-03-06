"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Loader2, X } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fetchLookupData } from "@/services/lookup-service";
import { getFilterParams, getNearbyBusinesses, getRestaurantsAction } from "@/app/actions/getRestaurantAction";
import type { BusinessPreview } from "@/types";
import type { Option } from "@/lib/schemaCreateBusiness";
import SearchComponent from "./search-term";
import CityFilter from "@/app/cityFilter";
import FilterDropdown from "@/app/filterDropdown";
import GpsSearchAnimation from "./gpsSearchAnimation";
import RestaurantCard from "@/app/restaurantCard";

// TODO: Remove foodTypes from here and more load to params...
const foodTypes = ["בשרי", "חלבי", "פרווה"];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"text" | "location" | "filter">("text");

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
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { ref, inView } = useInView();
  const [dataInitialized, setDataInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchRadius, setSearchRadius] = useState(15);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
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
      const tabParam = searchParams.get("tab") as "text" | "location" | "filter" | null;

      // Set the filter values from URL
      setSelectedCity(city);
      setSelectedFoodType(foodTypeParams.filter((type) => foodTypes.includes(type)));
      setSelectedBusinessTypes(businessTypeParams);
      setSelectedKosherTypes(kosherTypeParams);
      setSelectedFoodItems(foodItemParams);

      // Set active tab from URL or default to text
      if (tabParam && ["text", "location", "filter"].includes(tabParam)) {
        setActiveTab(tabParam);
      }

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

    // Add the active tab to URL
    params.append("tab", activeTab);

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
  }, [inView, isLoading, hasMore, isFiltering]);

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
  };

  const handleSearch = async () => {
    // Don't do anything if no filters are selected in filter tab
    if (activeTab === "filter" && !hasActiveFilters()) {
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
      params.append("tab", activeTab);

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
      setHasMore(response.length > 0);
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

  const handleLocationSearch = async () => {
    setLoading(true);
    setRestaurants([]);

    if (!navigator.geolocation) {
      toast.error("שגיאה בקבלת המיקום", {
        description: "הדפדפן שלך אינו תומך באיתור מיקום.",
      });
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });

      const response = await getNearbyBusinesses(latitude, longitude, searchRadius, 1, 10);
      setRestaurants(response.content);

      updateUrl();
    } catch (error) {
      console.error("Error getting location or nearby businesses:", error);
      toast.error("שגיאה בקבלת המיקום או בחיפוש עסקים קרובים", {
        description: "אנא נסה שוב או הזן מיקום ידנית.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-right" dir="rtl">
      <div className="mx-auto px-4 py-20 bg-pattern text-sm">
        <div className="max-w-3xl mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <header className="text-center mb-8">
            <h2 className="text-5xl is-kosher-font text-[#1A365D] font-bold mb-2">isKosher</h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">מצא מסעדות כשרות בסביבתך</p>
          </header>
          <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-center mb-6 space-x-2 space-x-reverse">
              <TabButton
                icon={<Search />}
                label="חיפוש טקסט"
                isActive={activeTab === "text"}
                onClick={() => setActiveTab("text")}
              />
              <TabButton
                icon={<MapPin />}
                label="חיפוש לפי מיקום"
                isActive={activeTab === "location"}
                onClick={() => setActiveTab("location")}
              />
              <TabButton
                icon={<Filter />}
                label="סינון מתקדם"
                isActive={activeTab === "filter"}
                onClick={() => setActiveTab("filter")}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "text" && (
                  <div className="relative">
                    <SearchComponent />
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-4">
                    <button
                      onClick={handleLocationSearch}
                      disabled={loading}
                      className="w-full bg-[#2D4A6D] text-white py-3 rounded-full hover:bg-[#2D4A6D] transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <MapPin className="ml-2" />}
                      קבל מיקום נוכחי וחפש
                    </button>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        טווח חיפוש: {searchRadius} ק"מ
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number.parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "filter" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FilterDropdown
                        filterOptions={kosherTypes}
                        loading={loading}
                        filterPlaceholder="סוג כשרות"
                        onSelectFilters={(selectedFilters) => setSelectedKosherTypes(selectedFilters)}
                        selectedFilters={selectedKosherTypes}
                      />
                      <FilterDropdown
                        filterOptions={foodItems}
                        loading={loading}
                        filterPlaceholder="סוג אוכל"
                        onSelectFilters={(selectedFilters) => setSelectedFoodItems(selectedFilters)}
                        selectedFilters={selectedFoodItems}
                      />
                      <FilterDropdown
                        filterOptions={businessTypes}
                        loading={loading}
                        filterPlaceholder="סוג עסק"
                        onSelectFilters={(selectedFilters) => setSelectedBusinessTypes(selectedFilters)}
                        selectedFilters={selectedBusinessTypes}
                      />
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          key="check-all"
                          variant="outline"
                          className="p-3 text-md border border-gray-300 rounded-lg hebrew-side hover:bg-gray-50"
                          onClick={handleCheckAll}
                          disabled={loading}
                        >
                          בחר הכל
                        </Button>
                        {foodTypes.map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            className={`p-3 text-md border rounded-lg hebrew-side ${
                              selectedFoodType.includes(type)
                                ? type === "חלבי"
                                  ? "border-blue-500 bg-blue-50"
                                  : type === "בשרי"
                                  ? "border-red-500 bg-red-50"
                                  : "border-green-500 bg-green-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => handleSelectFoodType(type)}
                            disabled={loading}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <CityFilter
                      onSelectCity={(city) => setSelectedCity(city)}
                      loading={loading}
                      selectedCity={selectedCity}
                    />
                    <div className="flex justify-between space-x-2 space-x-reverse">
                      {hasActiveFilters() && (
                        <Button
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-2 px-4 rounded-full"
                          onClick={resetFilters}
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-1" />
                          נקה סינון
                        </Button>
                      )}
                      <Button
                        onClick={handleSearch}
                        disabled={loading || !hasActiveFilters()}
                        className="bg-[#2D4A6D] text-white py-3 px-6 rounded-full hover:bg-[#2D4A6D] transition-colors disabled:opacity-70 flex-grow"
                      >
                        {loading ? (
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Search className="ml-2 h-5 w-5" />
                        )}
                        חפש לפי סינון
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Results List */}
      <ResultsList
        results={restaurants}
        isLoading={loading}
        hasActiveFilters={hasActiveFilters()}
        resetFilters={resetFilters}
        loadMoreRef={ref}
        hasMore={hasMore && !isFiltering && !loading}
      />
    </div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      className={`flex items-center px-4 py-2 rounded-full transition-all ${
        isActive ? "bg-[#2D4A6D] text-white" : "bg-white text-[#2D4A6D] hover:bg-indigo-100"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="mr-2">{label}</span>
    </button>
  );
}

interface ResultsListProps {
  results: BusinessPreview[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  loadMoreRef: React.RefCallback<HTMLDivElement>;
  hasMore: boolean;
}

function ResultsList({ results, isLoading, hasActiveFilters, resetFilters, loadMoreRef, hasMore }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="self-center h-60 w-60 mx-auto">
        <GpsSearchAnimation />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg p-6">
        <p className="text-2xl text-gray-600">לא נמצאו תוצאות</p>
        {hasActiveFilters && (
          <Button className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={resetFilters}>
            נקה סינון ונסה שוב
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mx-4">
        {results.map((result, index) => (
          <motion.div
            key={result.business_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <RestaurantCard key={result.business_id} restaurant={result} />
          </motion.div>
        ))}

        {hasMore && (
          <div ref={loadMoreRef} className="col-span-full self-center h-60 w-60 mx-auto">
            <GpsSearchAnimation />
          </div>
        )}
      </div>
    </>
  );
}
