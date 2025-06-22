"use server";

import { DEFAULT_SIZE_PAGE, TIMEOUT_MS } from "@/lib/constants";
import { BusinessSearchResult, BusinessPreview, PageResponse, BusinessDetailsResponse } from "@/types";
import { serverApi } from "@/utils/apiClient";

export async function getRestaurantsAction(page: number = 1): Promise<BusinessPreview[]> {
  try {
    // Set a timeout of 120 seconds
    const res = await serverApi.get<{
      content: BusinessPreview[];
    }>(`/discover/preview?size=${DEFAULT_SIZE_PAGE}&page=${page}`, {
      cache: "force-cache",
      tags: ["restaurants"],
      timeout: TIMEOUT_MS,
    });
    return res.content;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
}

export async function getRestaurant(id: string): Promise<BusinessDetailsResponse> {
  const res = await serverApi.get<BusinessDetailsResponse>(`/discover/${id}/details`, {
    cache: "force-cache",
    tags: ["restaurants"],
    timeout: TIMEOUT_MS,
  });
  if (!res) {
    throw new Error("Failed to fetch restaurant");
  }
  return res;
}

export async function getSearchTerm(text: string): Promise<BusinessSearchResult[]> {
  try {
    const response = await serverApi.get<BusinessSearchResult[]>(`/discover/search?query=${text}`, {
      tags: ["restaurants"],
      cache: "force-cache",
    });
    return response;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
}

export async function getFilterParams(params: string): Promise<BusinessPreview[]> {
  try {
    // Extract page and size from params or use defaults
    const urlParams = new URLSearchParams(params);
    if (!urlParams.has("page")) {
      urlParams.append("page", "0");
    }
    const response = await serverApi.get<{ content: BusinessPreview[] }>(
      `/discover/filter?size=${DEFAULT_SIZE_PAGE}&${urlParams.toString()}`,
      {
        tags: ["restaurants"],
        cache: "force-cache",
      }
    );
    return response.content;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
}

export async function getNearbyBusinesses(
  lat: number,
  lon: number,
  radius: number,
  page: number = 1,
  size: number = DEFAULT_SIZE_PAGE
): Promise<PageResponse<BusinessPreview>> {
  try {
    const response = await serverApi.get<PageResponse<BusinessPreview>>(
      `/discover/nearby?lat=${lat}&lon=${lon}&radius=${radius}&page=${page}&size=${size}`,
      {
        tags: ["restaurants"],
        cache: "force-cache",
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching nearby businesses:", error);
    throw error;
  }
}
