"use server";
import { formSchema } from "@/lib/schemaCreateBusiness";
import { transformFormDataToServerPayload } from "@/lib/transform";
import { RestaurantPreview } from "@/types";
import { serverApi } from "@/utils/apiClient";
import { z } from "zod";

export async function getMyBusinessAction(): Promise<RestaurantPreview[]> {
  const response = await serverApi.get<RestaurantPreview[]>("/admin/businesses/my-businesses", {
    includeCookies: true,
  });
  return response.data;
}

export async function createBusiness(data: z.infer<typeof formSchema>) {
  try {
    const serverPayload = await transformFormDataToServerPayload(data);
    console.log("Date to send backend: ", serverPayload);

    const response = await serverApi.post<any>("/admin/businesses/create-business", serverPayload, {
      includeCookies: true,
    });
    console.log("Response Backnd: ", response.data);

    console.log("Creating business: ", serverPayload);
    return { success: true };
  } catch (error) {
    console.error("Error creating business:", error);
    return { success: false, error: "Failed to create business" };
  }
}
