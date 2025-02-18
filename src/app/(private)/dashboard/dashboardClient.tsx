"use client";
import React from "react";
import RestaurantCard from "@/app/restaurantCard";
import Link from "next/link";
import { RestaurantPreview } from "@/types";
import { getMyBusinessAction } from "@/app/(private)/dashboard/page";
interface DashboardClientProps {
  getBusinessesAction: () => Promise<RestaurantPreview[]>;
}
export default function DashboardClient() {
  const [userBusinesses, setUserBusinesses] = React.useState<
    RestaurantPreview[]
  >([]);
  React.useEffect(() => {
    const updateUserBusinesses = async () => {
      const businesses = await getMyBusinessAction();
      setUserBusinesses(businesses);
    };

    updateUserBusinesses();
  }, []);
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBusinesses.map((userBusiness) => (
              <Link
                key={userBusiness.business_id}
                href={`/dashboard/edit/${userBusiness.business_id}`}
                className="transition-transform hover:scale-105"
              >
                <RestaurantCard
                  restaurant={{
                    id: userBusiness.business_id,
                    name: userBusiness.business_name,
                    type: userBusiness.business_type,
                    certification: userBusiness.kosher_type,
                    address: `${userBusiness.location.address} ${userBusiness.location.street_number}, ${userBusiness.location.city}`,
                    halavi: userBusiness.food_types.includes("חלבי"),
                    bessari: userBusiness.food_types.includes("בשרי"),
                    parve: userBusiness.food_types.includes("פרווה"),
                    image: userBusiness.business_photos[0]?.url || "",
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
