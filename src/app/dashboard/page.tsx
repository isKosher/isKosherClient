"use client";
import React, { useState, useEffect } from "react";
import RestaurantCard from "../restaurantCard";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface BusinessPhoto {
  url: string;
  photo_info: string;
}

interface Restaurant {
  business_id: string;
  business_name: string;
  food_types: string[];
  food_item_types: string[];
  address: string;
  street_number: number;
  city: string;
  business_photos: BusinessPhoto[];
  kosher_type: string;
  business_type: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUserRestaurants = async () => {
      setLoading(true);
      try {
        // Replace with actual user-specific endpoint
        const { data } = await axios.get<Restaurant[]>(
          "http://localhost:8080/api/v1/businesses/preview"
        );
        setRestaurants(data);
        setError("");
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRestaurants();
  }, []);

  const handleEdit = (businessId: string) => {
    router.push(`/dashboard/edit/${businessId}`);
  };

  // Return null or loading state while checking auth
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">
              לוח הבקרה שלי
            </h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">
              נהל את העסקים שלך
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          {loading ? (
            <div className="text-center">טוען...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.business_id}
                  href={`/dashboard/edit/${restaurant.business_id}`}
                  className="transition-transform hover:scale-105"
                >
                  <RestaurantCard
                    restaurant={{
                      name: restaurant.business_name,
                      type: restaurant.business_type,
                      certification: restaurant.kosher_type,
                      address: `${restaurant.address} ${restaurant.street_number}, ${restaurant.city}`,
                      halavi: restaurant.food_types.includes("חלבי"),
                      bessari: restaurant.food_types.includes("בשרי"),
                      parve: restaurant.food_types.includes("פרווה"),
                      image: restaurant.business_photos[0]?.url || "",
                    }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
