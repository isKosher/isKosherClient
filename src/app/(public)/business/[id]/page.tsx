import { Metadata } from "next";
import { RestaurantDetails } from "./restaurantDetails";
import { LatLngExpression } from "leaflet";

import { serverApi } from "@/utils/apiClient";
import { BusinessDetailsResponse } from "@/types";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  return {
    title: `${restaurant.business_name} | isKosher`,
    description: restaurant.business_details,
  };
}

export async function getRestaurant(id: string): Promise<BusinessDetailsResponse> {
  const res = await serverApi.get<BusinessDetailsResponse>(`/discover/${id}/details`);

  if (!res.data) {
    throw new Error("Failed to fetch restaurant");
  }

  return res.data;
}

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  let restaurant;
  let coordinates: LatLngExpression;

  try {
    restaurant = await getRestaurant(id);
    coordinates = { lat: restaurant.location.latitude, lng: restaurant.location.longitude };
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Error</div>;
  }

  return <RestaurantDetails restaurant={restaurant} coordinates={coordinates} />;
}
