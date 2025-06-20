"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessPreview } from "@/types";

type NearbyBusinessesProps = {
  businesses: BusinessPreview[];
};

const NearbyBusinesses: React.FC<NearbyBusinessesProps> = ({ businesses }) => {
  if (!businesses || businesses.length === 0) {
    return <p className="text-gray-500">לא נמצאו מסעדות נוספות באזור</p>;
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
