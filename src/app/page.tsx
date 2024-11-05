"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";
import FilterDropdown from "./filterDropdown";
import RestaurantCard from "./restaurantCard";

const KosherFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  type Restaurant = {
    id: number;
    name: string;
    foodType: string;
    certification: string;
    address: string;
    halavi: boolean;
    bessari: boolean;
    parve: boolean;
    image: string;
  };

  const [restaurants] = useState<Restaurant[]>([
    {
      id: 1,
      name: "גריל ירושלים",
      foodType: "מזרח תיכוני",
      certification: "בד״ץ",
      address: "המלך ג'ורג' 32, ירושלים",
      halavi: false,
      bessari: true,
      parve: false,
      image:
        "https://images.squarespace-cdn.com/content/v1/5091bda5e4b0979eac787995/1593700026088-RQT825FSDMZJ8AAAH7K6/Israeli-grilling-main.jpg?format=1500w",
    },
    {
      id: 2,
      name: "חלב ודבש",
      foodType: "מסעדה חלבית",
      certification: "מהדרין",
      address: "דיזנגוף 123, תל אביב",
      halavi: true,
      bessari: false,
      parve: false,
      image:
        "https://www.allrecipes.com/thmb/aefJMDXKqs42oAP71dQuYf_-Qdc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/6776_Pizza-Dough_ddmfs_4x3_1724-fd91f26e0bd6400a9e89c6866336532b.jpg",
    },
    {
      id: 3,
      name: "קפה 11",
      foodType: "ישראלי",
      certification: "רבנות",
      address: "הנביאים 45, חיפה",
      halavi: true,
      bessari: false,
      parve: true,
      image:
        "https://cdn.britannica.com/17/234017-050-F665E64D/cappuccino-Rome-Italy.jpg",
    },
    {
      id: 4,
      name: "סושי דילייט",
      foodType: "סושי",
      certification: "סטאר-קיי",
      address: "רוטשילד 78, ראשון לציון",
      halavi: false,
      bessari: false,
      parve: true,
      image:
        "https://www.yummymummykitchen.com/wp-content/uploads/2021/10/sashimi-vs-nigiri-1.jpg",
    },
    {
      id: 5,
      name: "פיצה פאלאס",
      foodType: "פיצה",
      certification: "או-יו כשר",
      address: "בן גוריון 15, רמת גן",
      halavi: true,
      bessari: false,
      parve: false,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJYqXs_eYTVeNtugtP2q7zV_ROewS7r5-Gkg&s",
    },
    {
      id: 6,
      name: "המבורגר שף",
      foodType: "אמריקאי",
      certification: "או-יו כשר",
      address: "הרצל 55, נתניה",
      halavi: false,
      bessari: true,
      parve: false,
      image: "https://cdn.jwplayer.com/v2/media/Ra8WKsWU/poster.jpg?width=720",
    },
    {
      id: 7,
      name: "מזרח מערב",
      foodType: "ים תיכוני",
      certification: "רבנות",
      address: "אלנבי 88, תל אביב",
      halavi: false,
      bessari: true,
      parve: true,
      image:
        "https://tastythriftytimely.com/wp-content/uploads/2023/06/Falafel-FEATURED.jpg",
    },
    {
      id: 8,
      name: "דלי שף",
      foodType: "מעדניה",
      certification: "בד״ץ",
      address: "ויצמן 23, רחובות",
      halavi: true,
      bessari: true,
      parve: true,
      image: "https://eatintlv.com/wp-content/uploads/2017/09/New-Deli3.jpg",
    },
    {
      id: 9,
      name: "סושי מאסטר",
      foodType: "סושי",
      certification: "סי-אר-סי",
      address: "סוקולוב 45, הרצליה",
      halavi: false,
      bessari: false,
      parve: true,
      image:
        "https://everydayglutenfreegourmet.ca/wp-content/uploads/2023/07/handmade-sushi-rolls.jpg",
    },
  ]);

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

  const handleSearch = () => {
    setLoading(true);
    // Simulate a search request with a delay
    setTimeout(() => {
      setLoading(false);
      // Logic to perform search goes here
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#EDF2F7]">
      {/* Main Content */}
      <div className="min-h-screen bg-cover bg-center ">
        <div className="mx-auto px-4 py-20 bg-pattern text-sm">
          <div className="max-w-3xl mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">
                isKosher
              </h2>
              <p className="text-[#2D4A6D] text-md lg:text-lg">
                מצא מסעדות כשרות בסביבתך
              </p>
            </div>

            {/* Search Filters */}
            <div className="space-y-4">
              {/* Location Search */}
              <Input
                className="w-full p-4 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg hebrew-side"
                placeholder="חפש לפי מיקום או שם מסעדה"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Certification Filter */}
                <FilterDropdown
                  filterOptions={certifications}
                  loading={loading}
                  filterPlaceholder="תבחר תעודת כשרות"
                />
                {/* Cuisine Filter */}
                <FilterDropdown
                  filterOptions={cuisineTypes}
                  loading={loading}
                  filterPlaceholder="תבחר סוג מטבח"
                />
              </div>

              <div className="flex items-center justify-center">
                {/* Buttons*/}
                <Button
                  className="w-full bg-[#1A365D] hover:bg-[#2D4A6D] text-white text-md lg:text-lg py-6"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <Search className="w-6 h-6 " />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard restaurant={restaurant} key={restaurant.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default KosherFinder;
