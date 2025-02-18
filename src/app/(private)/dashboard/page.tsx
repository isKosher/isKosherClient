"use server";
import DashboardClient from "./dashboardClient";
import { RestaurantPreview } from "@/types";
import { apiFetch } from "@/utils/axiosConfig";
export async function getMyBusinessAction(): Promise<RestaurantPreview[]> {
  return apiFetch<RestaurantPreview[]>("/admin/businesses/my-businesses", {
    method: "GET",
    includeCookies: true,
  });
}

export default async function DashboardPage() {
  try {
  } catch (error) {
    console.error("Error fetching businesses:", error);
  }
  return <DashboardClient />;
}
