"use client";
import React, { use, useEffect, useState } from "react";
import RestaurantCard from "@/app/restaurantCard";
import Link from "next/link";
import { BusinessPreview, RestaurantPreview } from "@/types";
import { getMyBusinessAction } from "@/app/actions/dashboardAction";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/components/ErrorPage";

export default function DashboardClient() {
  //TODO: Add type of UserOwnedBusinessResponse
  const [userBusinesses, setUserBusinesses] = useState<BusinessPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateUserBusinesses = async () => {
      try {
        setIsLoading(true);
        const businesses = await getMyBusinessAction();
        setUserBusinesses(businesses);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user businesses:", err);
        setError("Failed to load your businesses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    updateUserBusinesses();
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">לוח הבקרה שלי</h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">נהל את העסקים שלך</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBusinesses.map((userBusiness) => (
              <Link
                key={userBusiness.business_id}
                href={`/dashboard/edit/${userBusiness.business_id}`}
                className="transition-transform hover:scale-105"
              >
                <RestaurantCard restaurant={userBusiness} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
