"use server";

import { BusinessSearchResult, BusinessPreview } from "@/types";
import { serverApi } from "@/utils/apiClient";

//TODO: Add useing in cache for the data
export async function getRestaurantsAction(page: Number = 1): Promise<BusinessPreview[]> {
  try {
    const response = await serverApi.get<{
      content: BusinessPreview[];
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

export async function getSearchTrem(text: string): Promise<BusinessSearchResult[]> {
  try {
    const response = await serverApi.get<BusinessSearchResult[]>(`discover/search?query=${text}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
}

export async function getFilterParams(params: string): Promise<BusinessPreview[]> {
  try {
    const response = await serverApi.get<{ content: BusinessPreview[] }>(`discover/filter?${params}`);
    return response.data.content;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
}
