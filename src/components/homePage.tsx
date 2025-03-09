"use client";
import { useState, useEffect, useCallback } from "react";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Loader2, X } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchLookupData } from "@/services/lookup-service";
import { getFilterParams, getNearbyBusinesses, getRestaurantsAction } from "@/app/actions/getRestaurantAction";
import type { BusinessPreview, Coordinates } from "@/types";
import type { Option } from "@/lib/schemaCreateBusiness";
import SearchComponent from "./search-term";
import CityFilter from "@/app/cityFilter";
import FilterDropdown from "@/app/filterDropdown";
import LoadingPage from "@/app/loading";
import ResultsList from "./results-list";
import TabButton from "./tab-button";

// TODO: Remove foodTypes from here
const foodTypes = ["בשרי", "חלבי", "פרווה"];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  //TODO: replace to enum
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
  const [previewPage, setPreviewPage] = useState(2);
  const [locationPage, setLocationPage] = useState(2);
  const [filterPage, setFilterPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [locationHasMore, setLocationHasMore] = useState(true);
  const [filterHasMore, setFilterHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { ref, inView } = useInView();
  const [dataInitialized, setDataInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchRadius, setSearchRadius] = useState(15);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

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
  // TODO: replace to context
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

      // Check for location parameters
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const radius = searchParams.get("radius");

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
        // If we have location parameters and we're in the location tab
        if (tabParam === "location" && lat && lng && radius) {
          const latitude = Number.parseFloat(lat);
          const longitude = Number.parseFloat(lng);
          const searchRadius = Number.parseInt(radius);

          setUserLocation({ latitude, longitude });
          setSearchRadius(searchRadius);

          // Perform location search with saved coordinates
          const response = await getNearbyBusinesses(latitude, longitude, searchRadius);
          setRestaurants(response.content);
          setLocationHasMore(response.content.length > 0);
        } else if (hasUrlFilters) {
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

  // Add this new function to handle tab changes
  const handleTabChange = async (tab: "text" | "location" | "filter") => {
    // Don't do anything if we're already on this tab
    if (tab === activeTab) return;

    setLoading(true);

    // Reset all filters when changing tabs
    setSelectedCity("");
    setSelectedFoodType([]);
    setSelectedBusinessTypes([]);
    setSelectedKosherTypes([]);
    setSelectedFoodItems([]);

    // Reset pagination states
    setPreviewPage(2);
    setLocationPage(2);
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
        setIsFiltering(false);
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
      setLoading(false);
    }
  };

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

  // Update URL with location parameters
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

  const loadMore = async () => {
    // Don't load more if we're already loading
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      // Load more based on active tab
      if (activeTab === "text") {
        if (!hasMore) return;

        const newRestaurants = await getRestaurantsAction(previewPage);

        if (newRestaurants.length === 0) {
          setHasMore(false);
        } else {
          setRestaurants((prev) => [...prev, ...newRestaurants]);
          setPreviewPage((prev) => prev + 1);
        }
      } else if (activeTab === "location" && userLocation) {
        if (!locationHasMore) return;

        // Use only location parameters, no filters
        const response = await getNearbyBusinesses(
          userLocation.latitude,
          userLocation.longitude,
          searchRadius,
          locationPage
        );

        if (response.content.length === 0) {
          setLocationHasMore(false);
        } else {
          setRestaurants((prev) => [...prev, ...response.content]);
          setLocationPage((prev) => prev + 1);
        }
      } else if (activeTab === "filter" && hasActiveFilters()) {
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

  useEffect(() => {
    if (inView && !isLoading) {
      if (activeTab === "text" && hasMore && !isFiltering) {
        loadMore();
      } else if (activeTab === "location" && locationHasMore && userLocation) {
        loadMore();
      } else if (activeTab === "filter" && filterHasMore && hasActiveFilters()) {
        loadMore();
      }
    }
  }, [
    inView,
    isLoading,
    hasMore,
    locationHasMore,
    filterHasMore,
    activeTab,
    isFiltering,
    userLocation,
    hasActiveFilters,
  ]);

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
    setIsFiltering(false);

    // Reset all pagination states
    setPreviewPage(2);
    setLocationPage(2);
    setFilterPage(0);
    setHasMore(true);
    setLocationHasMore(true);
    setFilterHasMore(true);

    // Reset URL to remove all query parameters
    router.replace("/?tab=filter", { scroll: false });
    setRestaurants([]);
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

    setLoading(true);
    setFilterPage(0); // Reset filter page
    setFilterHasMore(true); // Reset hasMore flag

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
      setFilterHasMore(response.length > 0);
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
    setLocationPage(2); // Reset location page
    setLocationHasMore(true); // Reset hasMore flag

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
      setLoading(false);
    }
  };

  // Update URL when search radius changes and we have a location
  useEffect(() => {
    if (activeTab === "location" && userLocation) {
      updateLocationUrl(userLocation.latitude, userLocation.longitude, searchRadius);
    }
  }, [searchRadius, activeTab, userLocation]);

  if (loading) {
    return <LoadingPage />;
  }

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
                      onClearCity={handleClearCity}
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
        hasMore={
          (activeTab === "text" && hasMore && !isFiltering) ||
          (activeTab === "location" && locationHasMore && userLocation !== null) ||
          (activeTab === "filter" && filterHasMore && hasActiveFilters())
        }
      />
    </div>
  );
}
