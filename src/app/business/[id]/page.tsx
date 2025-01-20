import { Metadata } from "next";
import { RestaurantDetails } from "@/components/restaurantDetails";
import { LatLngExpression } from "leaflet";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  return {
    title: `${restaurant.business_name} | isKosher`,
    description: restaurant.business_details,
  };
}

export async function getRestaurant(id: string) {
  const res = await fetch(
    `http://localhost:8080/api/v1/businesses/${id}/details`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch restaurant");
  }

  return res.json();
}

export async function getCoordinates(
  address: string
): Promise<LatLngExpression> {
  let url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`;
  console.log(url);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch coordinates");
  }

  const data = await res.json();
  if (data.length === 0) {
    return [31.25181, 34.7913];
  }

  return { lat: data[0].lat, lng: data[0].lon };
}

export default async function RestaurantPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  let restaurant;
  let coordinates: LatLngExpression;

  try {
    restaurant = await getRestaurant(id);
    coordinates = await getCoordinates(
      `${restaurant.street_number} ${restaurant.address}, ${restaurant.city}`
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Error</div>;
  }

  return (
    <RestaurantDetails restaurant={restaurant} coordinates={coordinates} />
  );
}
