"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import FilterDropdown from "../app/filterDropdown";
import RestaurantCard from "../app/restaurantCard";
import { cn } from "@/lib/utils";
import CityFilter from "../app/cityFilter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import GpsSearchAnimation from "@/components/gpsSearchAnimation";
import { useInView } from "react-intersection-observer";
import { RestaurantPreview } from "@/types";
import { getRestaurantsAction } from "@/app/actions/getRestaurantAction";
import SearchComponent from "./search-term";
import { BASE_URL_IS_KOSHER_MANAGER } from "@/lib/constants";
import { toast } from "sonner";
import { fetchLookupData } from "@/services/lookup-service";
import { Option } from "@/lib/schemaCreateBusiness";

const foodTypes = ["בשרי", "חלבי", "פרווה"];

type homePageProps = {
  initialRestaurants: RestaurantPreview[];
};

export default function HomePage({ initialRestaurants }: homePageProps) {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<RestaurantPreview[]>(initialRestaurants);
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
  const { ref, inView } = useInView();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLookupData();

        // Transform and merge API data with existing options
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

  const loadMore = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const transformRestaurantData = (restaurant: RestaurantPreview) => {
    return {
      id: restaurant.business_id,
      name: restaurant.business_name,
      type: restaurant.business_type || "לא ידוע",
      certification: restaurant.kosher_type || "ללא תעודה",
      address: `${restaurant.location.street_number} ${restaurant.location.address}, ${restaurant.location.city}`,
      halavi: restaurant.food_item_types.includes("חלבי"),
      bessari: restaurant.food_item_types.includes("בשרי"),
      parve: restaurant.food_item_types.includes("פרווה"),
      image: restaurant.business_photos?.[0]?.url || "/default-restaurant.jpg",
    };
  };
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadMore();
    }
  }, [inView]);

  function handleSelectFoodType(selectedType: string) {
    selectedFoodType.includes(selectedType)
      ? setSelectedFoodType(selectedFoodType.filter((type) => type !== selectedType))
      : setSelectedFoodType(selectedFoodType.concat(selectedType));
  }

  const handleSearch = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      console.log(selectedFoodItems);
      console.log(selectedBusinessTypes);
      console.log(selectedKosherTypes);
      console.log(selectedCity);

      if (selectedCity) params.append("city", selectedCity);

      selectedFoodType.forEach((type) => {
        params.append("foodTypes", type);
      });

      selectedBusinessTypes.forEach((type) => {
        params.append("businessTypes", type);
      });

      selectedKosherTypes.forEach((type) => {
        params.append("kosherTypes", type);
      });

      const url = `https://iskoshermanager.onrender.com/api/v1/discover/filter?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }

      const data: { content: RestaurantPreview[] } = await response.json();
      setRestaurants(data.content);
      console.log(data.content);
    } catch (error) {
      console.error("Error searching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAll = () => {
    if (selectedFoodType.length === foodTypes.length) {
      setSelectedFoodType([]); // Uncheck all if all are already selected
    } else {
      setSelectedFoodType(foodTypes); // Check all
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
        text-[#2D4A6D] hover:bg-[#1A365D]/5 transition-all
        rounded-lg mt-2 mb-4"
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
                    className="flex-1 p-4 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg  h-full hebrew-side hover:bg-gray-500 hover:text-white"
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
                <CityFilter onSelectCity={(city) => setSelectedCity(city)} loading={loading} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center justify-center">
            <Button
              className="w-full bg-[#1A365D] hover:bg-[#2D4A6D] text-white text-md lg:text-lg py-6 mt-4"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="w-6 h-6 " />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 py-8 flex justify-center flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => {
            return (
              <div key={restaurant.business_id}>
                <RestaurantCard restaurant={transformRestaurantData(restaurant)} />
              </div>
            );
          })}
        </div>
        {hasMore && (
          <div ref={ref} className="self-center h-60 w-60">
            <GpsSearchAnimation />
          </div>
        )}
      </div>
    </div>
  );
}
