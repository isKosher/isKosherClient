import { Metadata } from "next";
import { LatLngExpression } from "leaflet";
import { serverApi } from "@/utils/apiClient";
import { BusinessDetailsResponse } from "@/types";
import BusinessDetails from "./business-details";
import { getRestaurant } from "@/app/actions/businessesAction";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  const business = await getRestaurant(id);
  return {
    title: `${business.business_name} | isKosher`,
    description: business.business_details,
  };
}

export default async function RestaurantPage({ params }: any) {
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
