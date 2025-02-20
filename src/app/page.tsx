import ErrorPage from "@/components/ErrorPage";
import HomePage from "@/components/homePage";
import { getRestaurantsAction } from "./actions/getRestaurantAction";

export default function Page() {
  return <PageContent />;
}

async function PageContent() {
  try {
    const initialRestaurants = await getRestaurantsAction();
    return <HomePage initialRestaurants={initialRestaurants} />;
  } catch (error) {
    return <ErrorPage />;
  }
}
