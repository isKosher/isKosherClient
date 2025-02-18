import { RestaurantPreview } from "@/types";
import { serverApi } from "@/utils/apiClient";

export async function getMyBusinessAction(): Promise<RestaurantPreview[]> {
  return serverApi.get<RestaurantPreview[]>("/admin/businesses/my-businesses", {
    includeCookies: true,
  });
}
