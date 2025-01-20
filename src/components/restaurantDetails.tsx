"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Restaurant } from "@/types";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";

export function RestaurantDetails(props: {
  restaurant: Restaurant;
  coordinates: LatLngExpression;
}) {
  const router = useRouter();
  const position: LatLngExpression = [31.25181, 34.7913];
  const Map = useMemo(
    () =>
      dynamic(() => import("./map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );
  return (
    <div className="min-h-screen bg-pattern bg-cover bg-center">
      <div className="mx-auto px-4 py-20 bg-pattern">
        <div className="max-w-4xl mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2" /> Back
          </Button>

          {/* Main Content */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">
              {props.restaurant.business_name}
            </h1>
            <p className="text-[#2D4A6D] text-lg">
              {props.restaurant.address} {props.restaurant.street_number},{" "}
              {props.restaurant.city}
            </p>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {props.restaurant.business_photos.map((photo, index) => {
              const [imgError, setImgError] = useState(false);
              return (
                <div
                  key={index}
                  className="relative h-64 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                >
                  {photo.url && !imgError ? (
                    <Image
                      src={photo.url}
                      alt={photo.photo_info || "Restaurant photo"}
                      fill
                      className="object-cover transition-opacity duration-300 hover:opacity-90"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-600 text-center font-medium">
                        {photo.photo_info || "No Image Available"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Map Section */}
          <div className="h-[400px] rounded-lg overflow-hidden shadow-lg mb-8">
            <Map position={props.coordinates} zoom={15} />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {/* Kosher Details */}
              <div className="p-4 bg-[#1A365D]/5 rounded-lg">
                <h2 className="font-bold text-[#1A365D] mb-2">
                  Kosher Details
                </h2>
                <p>Certification: {props.restaurant.kosher_type}</p>
                <p>Supervisor: {props.restaurant.supervisor_name}</p>
                <p>Authority: {props.restaurant.supervisor_authority}</p>
                <p>Expiration: {props.restaurant.expiration_date}</p>
              </div>

              {/* Business Type */}
              <div className="p-4 bg-[#1A365D]/5 rounded-lg">
                <h2 className="font-bold text-[#1A365D] mb-2">Business Type</h2>
                <p>{props.restaurant.business_type}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="p-4 bg-[#1A365D]/5 rounded-lg">
                <h2 className="font-bold text-[#1A365D] mb-2">Details</h2>
                <p>{props.restaurant.business_details}</p>
                <p>{props.restaurant.location_details}</p>
                <p>Rating: {props.restaurant.business_rating}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
