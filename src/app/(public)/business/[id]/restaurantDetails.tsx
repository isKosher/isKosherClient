"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Restaurant } from "@/types";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import SquareGallery from "@/components/squareGallery";

const images = [
  {
    src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=3099&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Image 2",
  },
  {
    src: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Image 3",
  },
  {
    src: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=3035&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Image 4",
  },
];

export function RestaurantDetails(props: {
  restaurant: Restaurant;
  coordinates: LatLngExpression;
}) {
  const router = useRouter();
  const position: LatLngExpression = [31.25181, 34.7913];
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );
  return (
    <div className="min-h-screen">
      <header className="bg-pattern bg-cover h-96 relative before:content-[''] before:absolute before:inset-0 before:bg-white/60">
        <div className="mx-8 relative z-10 flex justify-between items-center h-full">
          {" "}
          {/* New wrapper to ensure content stays above overlay */}
          {/* <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2" /> Back
          </Button> */}
          <div className="flex items-center gap-4">
            <Image
              src={
                "https://rest.jdn.co.il/wp-content/uploads/2022/09/Untitled-18-06.png"
              }
              alt="kosher beit yossef"
              width={80}
              height={80}
              className="mr-2"
            />
            <h2 className="text-2xl font-serif text-[#2D4A6D]">
              {props.restaurant.kosher_type}
            </h2>
          </div>
          <div className="text-end">
            <h1 className="text-6xl font-serif text-[#2D4A6D] font-bold mb-2">
              {props.restaurant.business_name}
            </h1>
            <p className="text-[#2D4A6D]/90 text-2xl flex items-center justify-end gap-2">
              {props.restaurant.location.address}{" "}
              {props.restaurant.location.street_number},{" "}
              {props.restaurant.location.city}
              <MapPin size={24} className="text-[#2D4A6D]/90" />
            </p>
          </div>
        </div>
      </header>
      <div className="bg-zinc-50 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Photos Grid */}
          <SquareGallery
            images={images.concat({
              src: props.restaurant.business_photos[0].url!,
              alt: "restaurant",
            })}
          />
          {/* Map Section */}
          <div className="rounded-lg max-w-2xl mx-auto overflow-hidden shadow-lg mb-8">
            <Map position={props.coordinates} zoom={15} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {/* Kosher Details */}
            <div className="p-4 bg-[#1A365D]/5 rounded-lg">
              <h2 className="font-bold text-[#1A365D] mb-2">Kosher Details</h2>
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
  );
}
