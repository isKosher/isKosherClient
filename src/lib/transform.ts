import { ServerPayload } from "@/types";
import { FormData } from "./schemaCreateBusiness";

export async function transformFormDataToServerPayload(formData: FormData): Promise<ServerPayload> {
  // Get coordinates from address using a geocoding service

  return {
    business_name: formData.business_name,
    business_phone: formData.business_phone,
    business_details: formData.business_details,
    business_rating: 4,
    location: {
      street_number: formData.location.street_number,
      address: formData.location.address,
      region: formData.location.area.name, // Using area name as region
      location_details: formData.location.location_details || "",
      city: formData.location.city,
      latitude: 0,
      longitude: 0,
    },
    kosher_types: formData.kosher_types.map((type) => type.name),
    business_type_name: formData.business_type.name,
    food_types: formData.food_types.map((type) => type.name),
    food_item_types: formData.food_items.map((item) => item.name),
    supervisor: {
      name: formData.supervisor.name,
      contact_info: formData.supervisor.contact_info,
      authority: formData.supervisor.authority,
    },
    kosher_certificate: {
      certificate: Math.round(Math.random() * 1000000).toString(),
      expiration_date: formData.kosher_certificate.expiration_date.toISOString().split("T")[0],
    },
  };
}
