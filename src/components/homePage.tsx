"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FilterDropdown from "../app/filterDropdown";
import RestaurantCard from "../app/restaurantCard";
import { cn } from "@/lib/utils";
import CityFilter from "../app/cityFilter";
import axios from "axios";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import GpsSearchAnimation from "@/components/gpsSearchAnimation";
import { useInView } from "react-intersection-observer";
import { RestaurantPreview } from "@/types";
import axiosInstance from "@/utils/axiosConfig";

const certifications = [
  "או יו כשר",
  "אוקיי כשר",
  "סטאר-קיי",
  "סי-אר-סי",
  "קוף-קיי",
  "רבנות",
  "מהדרין",
  "בד״ץ",
];

const cuisineTypes = [
  "ישראלי",
  "מזרח תיכוני",
  "אמריקאי",
  "מעדניה",
  "פיצה",
  "סושי",
  "ים תיכוני",
];

const businessTypes = ["מלון", "מסעדה", "קייטרינג"];

const foodTypes = ["בשרי", "חלבי", "פרווה"];

type homePageProps = {
  initialRestaurants: RestaurantPreview[];
};

export default function HomePage({ initialRestaurants }: homePageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] =
    useState<RestaurantPreview[]>(initialRestaurants);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedFoodType, setSelectedFoodType] = useState([""]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<{
        content: RestaurantPreview[];
      }>(`/api/v1/discover/preview?size=12&page=${page}`);

      if (!response.data.content) {
        setHasMore(false);
      } else {
        const newRestaurants = response.data.content;
        setRestaurants((prev) => [...prev, ...newRestaurants]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadMore();
    }
  }, [inView]);

  function handleSelectFoodType(selectedType: string) {
    selectedFoodType.includes(selectedType)
      ? setSelectedFoodType(
          selectedFoodType.filter((type) => type != selectedType)
        )
      : setSelectedFoodType(selectedFoodType.concat(selectedType));
  }

  const handleSearch = () => {
    setLoading(true);
    // Simulate a search request with a delay
    setTimeout(() => {
      setLoading(false);
      // Logic to perform search goes here
    }, 2500);
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
            <h2 className="text-5xl is-kosher-font text-[#1A365D] font-bold mb-2">
              isKosher
            </h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">
              מצא מסעדות כשרות בסביבתך
            </p>
          </div>
          <Input
            className="w-full p-4 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg hebrew-side"
            placeholder="חפש לפי מיקום או שם מסעדה"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-y-4 mt-4"
          >
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
                <ChevronDown
                  className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="collapsible-content space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FilterDropdown
                  filterOptions={certifications}
                  loading={loading}
                  filterPlaceholder="תבחר תעודת כשרות"
                />
                <FilterDropdown
                  filterOptions={cuisineTypes}
                  loading={loading}
                  filterPlaceholder="תבחר סוג מטבח"
                />
                <FilterDropdown
                  filterOptions={businessTypes}
                  loading={loading}
                  filterPlaceholder="תבחר סוג עסק"
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
                <CityFilter
                  onSelectCity={(city) => setSelectedCity(city)}
                  loading={loading}
                />
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
            if (restaurants.length === index + 1) {
              return (
                <div key={restaurant.business_id}>
                  <RestaurantCard
                    restaurant={{
                      id: restaurant.business_id,
                      name: restaurant.business_name,
                      type: restaurant.business_type,
                      certification: restaurant.kosher_type,
                      address: `${restaurant.location.street_number} ${restaurant.location.address}, ${restaurant.location.city}`,
                      halavi: restaurant.food_item_types.includes("חלבי"),
                      bessari: restaurant.food_item_types.includes("בשרי"),
                      parve: restaurant.food_item_types.includes("פרווה"),
                      image: restaurant.business_photos[0]?.url || "",
                    }}
                  />
                </div>
              );
            } else {
              return (
                <div key={restaurant.business_id}>
                  <RestaurantCard
                    restaurant={{
                      id: restaurant.business_id,
                      name: restaurant.business_name,
                      type: restaurant.business_type,
                      certification: restaurant.kosher_type,
                      address: `${restaurant.location.street_number} ${restaurant.location.address}, ${restaurant.location.city}`,
                      halavi: restaurant.food_item_types.includes("חלבי"),
                      bessari: restaurant.food_item_types.includes("בשרי"),
                      parve: restaurant.food_item_types.includes("פרווה"),
                      image: restaurant.business_photos[0]?.url || "",
                    }}
                  />
                </div>
              );
            }
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
