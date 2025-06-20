import { Metadata } from "next";
import { LatLngExpression } from "leaflet";
import { BusinessDetailsResponse, BusinessPreview } from "@/types";
import BusinessDetails from "./business-details";
import { getNearbyBusinesses, getRestaurant } from "@/app/actions/businessesAction";
import { PAGE_NEARBY_BUSINESS, RADIUS_NEARBY_BUSINESS, SIZE_NEARBY_BUSINESS } from "@/lib/constants";

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
  let nearbyBusinesses: BusinessPreview[] = [];

  try {
    business = await getRestaurant(id);
    coordinates = { lat: business.location.latitude, lng: business.location.longitude };

    const nearby = await getNearbyBusinesses(
      coordinates.lat,
      coordinates.lng,
      RADIUS_NEARBY_BUSINESS,
      PAGE_NEARBY_BUSINESS,
      SIZE_NEARBY_BUSINESS
    );

    nearbyBusinesses = nearby.content.filter((b) => b.business_id !== business.business_id);
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Error</div>;
  }

  return <BusinessDetails business={business} coordinates={coordinates} nearbyBusinesses={nearbyBusinesses} />;
}
