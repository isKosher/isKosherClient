import ErrorPage from "@/components/ErrorPage";
import HomePage from "@/components/homePage";
import { BASE_URL_IS_KOSHER_MANAGER } from "@/lib/constants";
import { RestaurantPreview } from "@/types";
import { serverApi } from "@/utils/apiClient";

async function getInitialRestaurants() {
  try {
    const response = await serverApi.get<{
      content: RestaurantPreview[];
    }>(`${BASE_URL_IS_KOSHER_MANAGER}/discover/preview?size=12&page=1`);
    if (!response.content) {
      return [];
    } else {
      return response.content;
    }
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
}

export default function Page() {
  return <PageContent />;
}

async function PageContent() {
  try {
    const initialRestaurants = await getInitialRestaurants();
    return <HomePage initialRestaurants={initialRestaurants} />;
  } catch (error) {
    return <ErrorPage />;
  }
}
