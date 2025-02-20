"use server";

import { RestaurantPreview } from "@/types";
import { serverApi } from "@/utils/apiClient";

export async function getRestaurantsAction(page: Number = 1): Promise<RestaurantPreview[]> {
  try {
    const response = await serverApi.get<{
      content: RestaurantPreview[];
    }>(`/discover/preview?size=12&page=${page}`);
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
