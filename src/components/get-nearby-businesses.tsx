"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getNearbyBusinesses } from "@/app/actions/businessesAction";
import { LatLngExpression } from "leaflet";
import { BusinessPreview } from "@/types";

type NearbyBusinessesProps = {
  coordinates: LatLngExpression;
};
const RADIUS_NEARBY_BUSINESS = 5;
const PAGE_NEARBY_BUSINESS = 1;
const SIZE_NEARBY_BUSINESS = 6;

const BusinessSkeleton = () => (
  <Card className="w-full">
    <CardContent className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </CardContent>
  </Card>
);

const NearbyBusinesses: React.FC<NearbyBusinessesProps> = ({ coordinates }) => {
  const [businesses, setBusinesses] = useState<BusinessPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyBusinesses = async () => {
      try {
        setIsLoading(true);
        const lat = Array.isArray(coordinates) ? coordinates[0] : coordinates.lat;
        const lng = Array.isArray(coordinates) ? coordinates[1] : coordinates.lng;
        if (!lat || !lng || lat === 0 || lng === 0) {
          setBusinesses([]);
          setIsLoading(false);
          return;
        }
        const response = await getNearbyBusinesses(
          lat,
          lng,
          RADIUS_NEARBY_BUSINESS,
          PAGE_NEARBY_BUSINESS,
          SIZE_NEARBY_BUSINESS
        );

        setBusinesses(response.content.slice(1));
      } catch (error) {
        console.error("Error fetching nearby businesses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyBusinesses();
  }, [coordinates]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(5)].map((_, index) => (
          <BusinessSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {businesses.map((business) => (
        <motion.div
          key={business.business_id}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          onClick={() => (window.location.href = `/business/${business.business_id}`)}
        >
          <Card className="w-full">
            <CardContent className="p-3">
              <h3 className="text-lg font-semibold">{business.business_name}</h3>
              <p className="text-gray-500 text-sm">
                {business.location.city}, {business.location.address} {business.location.street_number}
              </p>

              {business.food_types.length > 0 && (
                <p className="text-xs text-gray-600">{business.food_types.join(", ")}</p>
              )}
              <div className="flex justify-start gap-1">
                {business.travel_info?.driving_duration && (
                  <p className="text-xs text-blue-600">{business.travel_info.driving_duration} נסיעה</p>
                )}

                {business.travel_info?.walking_duration && (
                  <p className="text-xs text-blue-600">{business.travel_info.walking_duration} הליכה</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default NearbyBusinesses;
