import { RestaurantPreview } from "@/types";
import { apiFetch } from "@/utils/axiosConfig";

export async function getMyRestaurants(): Promise<RestaurantPreview[]> {
  return apiFetch<RestaurantPreview[]>("/admin/businesses/my-businesses", {
    method: "GET",
    includeCookies: true,
  });
}
