"use client";
import { useState, useEffect, useCallback } from "react";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Loader2, X } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BusinessPreview, Coordinates } from "@/types";
import SearchComponent from "./search-term";
import ResultsList from "./results-list";
import TabButton from "./tab-button";
import { useLookupData } from "@/contexts/lookup-context";
import { foodTypeNames } from "@/data/static-data";
import { getFilterParams, getNearbyBusinesses, getRestaurantsAction } from "@/app/actions/businessesAction";
import FilterDropdown from "./filterDropdown";
import CityFilter from "./cityFilter";

export default function HomePage({ tab: initialTab }: { tab: "text" | "location" | "filter" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use the lookup context
  const {
    businessTypes,
    kosherTypes,
    foodItems,
    isLoading: contextLoading,
    isInitialized: dataInitialized,
    error: contextError,
  } = useLookupData();

  // Component state
  const [activeTab, setActiveTab] = useState<"text" | "location" | "filter">(initialTab);
  const [restaurants, setRestaurants] = useState<BusinessPreview[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedFoodType, setSelectedFoodType] = useState<string[]>([]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [selectedKosherTypes, setSelectedKosherTypes] = useState<string[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<string[]>([]);

  const [previewPage, setPreviewPage] = useState(2);
  const [filterPage, setFilterPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [locationHasMore, setLocationHasMore] = useState(true);
  const [filterHasMore, setFilterHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { ref, inView } = useInView();
  const [searchRadius, setSearchRadius] = useState(15);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Handle context errors
  useEffect(() => {
    if (contextError) {
      toast.error("שגיאה בטעינת הנתונים", {
        description: contextError,
      });
    }
  }, [contextError]);

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

  // Initialize filters from URL and load appropriate data - only runs once
  useEffect(() => {
    const initializeData = async () => {
      // Check if there are any filters in the URL
      const city = searchParams.get("city") || "";
      const foodTypeParams = searchParams.getAll("foodTypes");
      const businessTypeParams = searchParams.getAll("businessTypes");
      const kosherTypeParams = searchParams.getAll("kosherTypes");
      const foodItemParams = searchParams.getAll("foodItems");

      // Check for location parameters
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const radius = searchParams.get("radius");

      // Set the filter values from URL
      setSelectedCity(city);
      setSelectedFoodType(foodTypeParams.filter((type) => foodTypeNames.includes(type)));
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
        // If we have location parameters and we're in the location tab
        if (activeTab === "location" && lat && lng && radius) {
          const latitude = Number.parseFloat(lat);
          const longitude = Number.parseFloat(lng);
          const searchRadius = Number.parseInt(radius);

          setUserLocation({ latitude, longitude });
          setSearchRadius(searchRadius);

          // Perform location search with saved coordinates
          const response = await getNearbyBusinesses(latitude, longitude, searchRadius);
          setRestaurants(response.content);
          setLocationHasMore(response.content.length > 0);
        } else if (activeTab === "filter" && hasUrlFilters) {
          // If we have URL filters, fetch filtered results directly

          const params = new URLSearchParams(searchParams.toString());
          const filteredRestaurants = await getFilterParams(params.toString());

          setRestaurants(filteredRestaurants);
          setHasMore(filteredRestaurants.length > 0);
        } else if (activeTab === "text") {
          // No filters, load initial data
          const initialData = await getRestaurantsAction();
          setRestaurants(initialData);
          setHasMore(initialData.length > 0);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        toast.error("שגיאה בטעינת הנתונים", {
          description: "אירעה שגיאה בטעינת הנתונים הראשוניים.",
        });

        // Fallback to empty state
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Load more restaurants when the user scrolls to the bottom of the page
  useEffect(() => {
    if (inView && !isLoading) {
      const handleGetRestaurants = async () => {
        setIsLoading(true);
        try {
          if (activeTab === "text" && hasMore) {
            loadMoreByText();
          } else if (activeTab === "location" && locationHasMore && userLocation) {
            loadMoreByLocation();
          } else if (activeTab === "filter" && filterHasMore && hasActiveFilters()) {
            loadMoreByFilter();
          }
        } catch (error) {
          console.error("Error fetching more restaurants:", error);
          toast.error("שגיאה בטעינת הנתונים", {
            description: "אירעה שגיאה בטעינת מסעדות נוספות.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      handleGetRestaurants();
    }
  }, [inView, activeTab, hasMore, locationHasMore, filterHasMore]);

  // Update URL when search radius changes and we have a location
  useEffect(() => {
    if (activeTab === "location" && userLocation) {
      updateLocationUrl(userLocation.latitude, userLocation.longitude, searchRadius);
    }
  }, [searchRadius, activeTab, userLocation]);

  const handleTabChange = async (tab: "text" | "location" | "filter") => {
    // Don't do anything if we're already on this tab
    if (tab === activeTab) return;

    // Reset all filters when changing tabs
    setSelectedCity("");
    setSelectedFoodType([]);
    setSelectedBusinessTypes([]);
    setSelectedKosherTypes([]);
    setSelectedFoodItems([]);

    // Reset pagination states
    setPreviewPage(2);
    setFilterPage(0);
    setHasMore(true);
    setLocationHasMore(true);
    setFilterHasMore(true);

    // Update the active tab
    setActiveTab(tab);

    try {
      // If switching to text tab, reset URL and load initial data
      if (tab === "text") {
        router.replace("/", { scroll: false });
        const initialData = await getRestaurantsAction();
        setRestaurants(initialData);
      }
      // If switching to location tab, clear results until location search is performed
      else if (tab === "location") {
        // Check if we already have location params in the URL
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");
        const radius = searchParams.get("radius");

        if (lat && lng && radius) {
          // If we have location params, use them to perform a search
          const latitude = Number.parseFloat(lat);
          const longitude = Number.parseFloat(lng);
          const searchRadius = Number.parseInt(radius);

          setUserLocation({ latitude, longitude });
          setSearchRadius(searchRadius);

          // Perform location search with saved coordinates
          const response = await getNearbyBusinesses(latitude, longitude, searchRadius);
          setRestaurants(response.content);
          setLocationHasMore(response.content.length > 0);
        } else {
          // No location params, just update the URL and clear results
          router.replace(`?tab=${tab}`, { scroll: false });
          setRestaurants([]);
          setUserLocation(null);
        }
      }
      // If switching to filter tab, clear results until filters are applied
      else if (tab === "filter") {
        router.replace(`?tab=${tab}`, { scroll: false });
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Error changing tabs:", error);
      toast.error("שגיאה בטעינת הנתונים", {
        description: "אירעה שגיאה בטעינת נתונים בעת החלפת לשונית.",
      });
    } finally {
      setIsLoading(false);
    }
  };
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
  const updateLocationUrl = (latitude: number, longitude: number, radius: number) => {
    const params = new URLSearchParams();

    // Add the active tab to URL
    params.append("tab", "location");

    // Add location parameters
    params.append("lat", latitude.toString());
    params.append("lng", longitude.toString());
    params.append("radius", radius.toString());

    // Replace current URL with the new one
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  const loadMoreByText = async () => {
    if (!hasMore) return;

    const newRestaurants = await getRestaurantsAction(previewPage);

    if (newRestaurants.length === 0) {
      setHasMore(false);
    } else {
      setRestaurants((prev) => [...prev, ...newRestaurants]);
      setPreviewPage((prev) => prev + 1);
    }
  };
  const loadMoreByLocation = async () => {
    if (!locationHasMore || !userLocation) return;

    // Use only location parameters, no filters
    const response = await getNearbyBusinesses(
      userLocation.latitude,
      userLocation.longitude,
      searchRadius,
      previewPage
    );

    if (response.content.length === 0) {
      setLocationHasMore(false);
    } else {
      setRestaurants((prev) => [...prev, ...response.content]);
      setPreviewPage((prev) => prev + 1);
    }
  };
  const loadMoreByFilter = async () => {
    if (!filterHasMore) return;

    const params = new URLSearchParams();
    params.append("tab", activeTab);
    params.append("page", (filterPage + 1).toString());

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

    const newRestaurants = await getFilterParams(params.toString());

    if (newRestaurants.length === 0) {
      setFilterHasMore(false);
    } else {
      setRestaurants((prev) => [...prev, ...newRestaurants]);
      setFilterPage((prev) => prev + 1);
    }
  };
  const handleSelectFoodType = (selectedType: string) => {
    setSelectedFoodType((prev) =>
      prev.includes(selectedType) ? prev.filter((type) => type !== selectedType) : [...prev, selectedType]
    );
  };
  const resetFilters = async () => {
    setSelectedCity("");
    setSelectedFoodType([]);
    setSelectedBusinessTypes([]);
    setSelectedKosherTypes([]);
    setSelectedFoodItems([]);

    setRestaurants([]);
    setPreviewPage(2);
    // Reset URL to remove all query parameters
    router.replace("/?tab=filter", { scroll: false });
  };
  const handleClearCity = () => {
    setSelectedCity("");
    updateUrl();
  };
  const handleSearch = async () => {
    // Don't do anything if no filters are selected in filter tab
    if (activeTab === "filter" && !hasActiveFilters()) {
      return;
    }

    setIsLoading(true);
    setFilterPage(0); // Reset filter page
    setFilterHasMore(true); // Reset hasMore flag

    // Update URL with current filters
    updateUrl();

    // Clear current results before searching
    setRestaurants([]);

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
      setFilterHasMore(response.length > 0);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      toast.error("שגיאה בטעינת הנתונים", {
        description: "אירעה שגיאה בחיפוש. אנא נסה שנית.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleCheckAll = () => {
    if (selectedFoodType.length === foodTypeNames.length) {
      setSelectedFoodType([]); // Uncheck all if all are already selected
    } else {
      setSelectedFoodType([...foodTypeNames]); // Check all
    }
  };
  const handleLocationSearch = async () => {
    setIsLoading(true);
    setRestaurants([]);
    setPreviewPage(2); // Reset location page
    setLocationHasMore(true); // Reset hasMore flag

    if (!navigator.geolocation) {
      toast.error("שגיאה בקבלת המיקום", {
        description: "הדפדפן שלך אינו תומך באיתור מיקום.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });

      // Use only location parameters, no filters from other tabs
      const response = await getNearbyBusinesses(latitude, longitude, searchRadius);
      setRestaurants(response.content);
      setLocationHasMore(response.content.length > 0);

      // Update URL with location parameters
      updateLocationUrl(latitude, longitude, searchRadius);
    } catch (error) {
      console.error("Error getting location or nearby businesses:", error);
      toast.error("שגיאה בקבלת המיקום או בחיפוש עסקים קרובים", {
        description: "אנא נסה שוב או הזן מיקום ידנית.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-right" dir="rtl">
      <div className="mx-auto px-4 py-20 bg-pattern text-sm">
        <div className="max-w-3xl mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <header className="text-center mb-2">
            <h2 className="text-5xl is-kosher-font text-[#1A365D] font-bold mb-2">isKosher</h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">מצא מסעדות כשרות בסביבתך</p>
          </header>
          {contextLoading && activeTab === "filter" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-blue-700">טוען נתוני סינון...</span>
              </div>
            </div>
          )}
          <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-center flex-col sm:flex-row mb-6 gap-2">
              <TabButton
                icon={<Search />}
                label="חיפוש טקסט"
                isActive={activeTab === "text"}
                onClick={() => handleTabChange("text")}
              />
              <TabButton
                icon={<MapPin />}
                label="חיפוש לפי מיקום"
                isActive={activeTab === "location"}
                onClick={() => handleTabChange("location")}
              />
              <TabButton
                icon={<Filter />}
                label="סינון מתקדם"
                isActive={activeTab === "filter"}
                onClick={() => handleTabChange("filter")}
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
                      disabled={isLoading}
                      className="w-full bg-[#2D4A6D] text-white py-3 rounded-full hover:bg-[#2D4A6D] transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <MapPin className="ml-2" />}
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
                        loading={isLoading}
                        filterPlaceholder="סוג כשרות"
                        onSelectFilters={(selectedFilters) => setSelectedKosherTypes(selectedFilters)}
                        selectedFilters={selectedKosherTypes}
                      />
                      <FilterDropdown
                        filterOptions={foodItems}
                        loading={isLoading}
                        filterPlaceholder="סוג אוכל"
                        onSelectFilters={(selectedFilters) => setSelectedFoodItems(selectedFilters)}
                        selectedFilters={selectedFoodItems}
                      />
                      <FilterDropdown
                        filterOptions={businessTypes}
                        loading={isLoading}
                        filterPlaceholder="סוג עסק"
                        onSelectFilters={(selectedFilters) => setSelectedBusinessTypes(selectedFilters)}
                        selectedFilters={selectedBusinessTypes}
                      />
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          key="check-all"
                          variant="outline"
                          className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                          onClick={handleCheckAll}
                          disabled={isLoading}
                        >
                          בחר הכל
                        </Button>
                        {foodTypeNames.map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            className={`p-3 text-md hebrew-side ${
                              selectedFoodType.includes(type)
                                ? type === "חלבי"
                                  ? "border-blue-500 bg-blue-50"
                                  : type === "בשרי"
                                  ? "border-red-500 bg-red-50"
                                  : "border-green-500 bg-green-50"
                                : "border-sky-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handleSelectFoodType(type)}
                            disabled={isLoading}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <CityFilter
                      onSelectCity={(city) => setSelectedCity(city)}
                      onClearCity={handleClearCity}
                      loading={isLoading}
                      selectedCity={selectedCity}
                    />
                    <div className="flex justify-between space-x-2 space-x-reverse">
                      {hasActiveFilters() && (
                        <Button
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-2 px-4 rounded-full"
                          onClick={resetFilters}
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4 mr-1" />
                          נקה סינון
                        </Button>
                      )}
                      <Button
                        onClick={handleSearch}
                        disabled={isLoading || !hasActiveFilters()}
                        className="bg-[#2D4A6D] text-white py-3 px-6 rounded-full hover:bg-[#2D4A6D] transition-colors disabled:opacity-70 flex-grow"
                      >
                        {isLoading ? (
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
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters()}
        resetFilters={resetFilters}
        loadMoreRef={ref}
        page={previewPage}
        hasMore={
          (activeTab === "text" && hasMore) ||
          (activeTab === "location" && locationHasMore && userLocation !== null) ||
          (activeTab === "filter" && filterHasMore && hasActiveFilters())
        }
      />
    </div>
  );
}
