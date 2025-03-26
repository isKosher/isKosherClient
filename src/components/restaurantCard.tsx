"use client";
import { Car, Footprints, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { foodTypes } from "@/data/static-data";
import { BusinessPreview } from "@/types";

interface RestaurantCardProps {
  restaurant: BusinessPreview;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-white bg-opacity-70 backdrop-filter rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/business/${restaurant.business_id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-indigo-900">{restaurant.business_name}</h3>
          <p className="text-indigo-700">{restaurant.business_type}</p>
          <p className="text-gray-600 flex items-center mt-2">
            <MapPin className="w-4 h-4 ml-1" />
            {` ${restaurant.location.address} ${restaurant.location.street_number}, ${restaurant.location.city}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {restaurant.food_types.includes(foodTypes[0].name) && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                חלבי
              </Badge>
            )}
            {restaurant.food_types.includes(foodTypes[1].name) && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                בשרי
              </Badge>
            )}
            {restaurant.food_types.includes(foodTypes[2].name) && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                פרווה
              </Badge>
            )}
          </div>
          {restaurant?.travel_info && (
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center mr-1">
                <Car className="w-4 h-4 ml-1" />
                <span>
                  {restaurant.travel_info.driving_distance} ({restaurant.travel_info.driving_duration})
                </span>
              </div>
              <div className="flex items-center mr-1">
                <Footprints className="w-4 h-4 ml-1" />
                <span>
                  {restaurant.travel_info.walking_distance} ({restaurant.travel_info.walking_duration})
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <Badge className="text-sm flex justify-between items-center" variant="outline">
            {restaurant.kosher_types?.[0]?.kosher_icon_url && (
              <Image
                src={restaurant.kosher_types[0].kosher_icon_url || "/placeholder.svg"}
                alt="kosher icon"
                width={40}
                height={40}
                className="mr-1"
              />
            )}
            <span className="mr-1">{restaurant.kosher_types[0]?.name || "ללא תעודה"}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
