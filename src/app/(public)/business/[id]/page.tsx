import { Metadata } from "next";
import { LatLngExpression } from "leaflet";
import { serverApi } from "@/utils/apiClient";
import { BusinessDetailsResponse } from "@/types";
import BusinessDetails from "./business-details";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const business = await getRestaurant(id);
  return {
    title: `${business.business_name} | isKosher`,
    description: business.business_details,
  };
}

export async function getRestaurant(id: string): Promise<BusinessDetailsResponse> {
  const res = await serverApi.get<BusinessDetailsResponse>(`/discover/${id}/details`, {
    cache: "force-cache",
  });
  if (!res) {
    throw new Error("Failed to fetch restaurant");
  }

  return res.json();
}

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  let business: BusinessDetailsResponse;
  let coordinates: LatLngExpression;

  try {
    business = await getRestaurant(id);
    coordinates = { lat: business.location.latitude, lng: business.location.longitude };
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Error</div>;
  }

  return <BusinessDetails business={business} coordinates={coordinates} />;
}
