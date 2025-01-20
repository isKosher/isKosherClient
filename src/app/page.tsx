import HomePage from "@/components/homePage";
import axios from "axios";

async function getInitialRestaurants() {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/v1/businesses/preview?size=12&page=1"
    );
    if (!response.data.content) {
      return [];
    } else {
      return response.data.content;
    }
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }
}

export default async function Page() {
  const initialRestaurants = await getInitialRestaurants();
  return <HomePage initialRestaurants={initialRestaurants} />;
}
