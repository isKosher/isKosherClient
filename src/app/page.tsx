import ErrorPage from "@/components/ErrorPage";
import HomePage from "@/components/homePage";
import axiosInstance from "@/utils/axiosConfig";
import { Suspense } from "react";

async function getInitialRestaurants() {
  try {
    const response = await axiosInstance.get(
      "/api/v1/discover/preview?size=12&page=1"
    );
    if (!response.data.content) {
      return [];
    } else {
      return response.data.content;
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
