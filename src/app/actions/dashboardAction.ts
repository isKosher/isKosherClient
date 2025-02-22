"use server";
import { formSchema } from "@/lib/schemaCreateBusiness";
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
    // Here you would typically:
    // 1. Upload the image to your storage service
    // 2. Save the data to your database
    // 3. Send confirmation emails, etc.

    console.log("Creating business:", data);

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    console.error("Error creating business:", error);
    return { success: false, error: "Failed to create business" };
  }
}
