"use server";
import { RestaurantPreview } from "@/types";
import { serverApi } from "@/utils/apiClient";

export async function getMyBusinessAction(): Promise<RestaurantPreview[]> {
  const response = await serverApi.get<RestaurantPreview[]>("/admin/businesses/my-businesses", {
    includeCookies: true,
  })
  return response.data;
}
