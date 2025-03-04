import ErrorPage from "@/components/ErrorPage";
import HomePage from "@/components/homePage";
import { getRestaurantsAction } from "./actions/getRestaurantAction";

export default function Page() {
  return <PageContent />;
}

async function PageContent() {
  try {
    return <HomePage />;
  } catch (error) {
    return <ErrorPage />;
  }
}
