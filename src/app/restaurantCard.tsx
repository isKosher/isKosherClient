import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { BusinessPreview } from "@/types";
import { foodTypes } from "@/data/staticData";

interface RestaurantCardProps {
  restaurant: BusinessPreview;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter();

  return (
    <Card
      className="hover:shadow-lg transition-shadow rounded-lg cursor-pointer"
      onClick={() => router.push(`/business/${restaurant.business_id}`)}
    >
      {/* <Image
        src={restaurant.business_photos?.[0]?.url || "/default-restaurant.jpg"}
        alt={restaurant.business_name}
        width={400}
        height={200}
        className="w-full h-48 object-cover rounded-t-lg" // Apply rounded class here
      /> */}
      <CardHeader>
        <div className="flex justify-between items-start flex-row-reverse">
          <div>
            <CardTitle className="text-xl">{restaurant.business_name}</CardTitle>
            <CardDescription dir="rtl">{restaurant.business_type}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center flex-row-reverse">
          <div className="flex items-center gap-2 text-gray-600 mb-2 flex-row-reverse">
            <MapPin className="h-4 w-4" />
            <span className="text-sm text-end">{`${restaurant.location.street_number} ${restaurant.location.address}, ${restaurant.location.city}`}</span>
          </div>
          <Badge className="text-sm flex justify-between align-center" variant="outline">
            {restaurant.kosher_types?.[0]?.kosher_icon_url && (
              <Image
                src={restaurant.kosher_types[0].kosher_icon_url}
                alt="kosher icon"
                width={40}
                height={40}
                className="mr-2"
              />
            )}
            {restaurant.kosher_types[0].name || "ללא תעודה"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
