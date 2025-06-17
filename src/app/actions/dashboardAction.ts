"use server";
import { formSchema } from "@/lib/schemaCreateBusiness";
import { transformFormDataToServerPayload } from "@/lib/transform";
import {
  BusinessPhotoDto,
  KosherCertificateDto,
  KosherSupervisor,
  KosherSupervisorDto,
  LocationDto,
  UserOwnedBusinessResponse,
} from "@/types";
import { serverApi } from "@/utils/apiClient";
import { z } from "zod";

export async function getMyBusinessAction(): Promise<UserOwnedBusinessResponse[]> {
  const response = await serverApi.get<UserOwnedBusinessResponse[]>("/admin/businesses/my-businesses", {
    includeCookies: true,
  });
  return response.json();
}

export async function createBusiness(data: z.infer<typeof formSchema>) {
  try {
    const serverPayload = await transformFormDataToServerPayload(data);
    console.log("Date to send backend: ", serverPayload);

    const response = await serverApi.post<any>("/admin/businesses/create-business", serverPayload, {
      includeCookies: true,
    });
    console.log("Response Backnd: ", (await response.json()).data);

    console.log("Creating business: ", (await response.json()).data);
    return { success: true };
  } catch (error) {
    console.error("Error creating business:", error);
    return { success: false, error: "Failed to create business" };
  }
}

// Type definitions based on your Java DTO
export type BusinessUpdateRequest = {
  business_id: string;
  business_name?: string;
  business_phone?: string;
  business_details?: string;
  business_rating?: number;
  kosher_types?: string[];
  business_type?: string;
  food_types?: string[];
  food_item_types?: string[];
};

export type SupervisorUpdateRequest = {
  business_id: string;
  supervisor: Omit<KosherSupervisor, "id">;
};

export type CertificateUpdateRequest = {
  business_id: string;
  certificate: KosherCertificateDto;
};

export type PhotoUpdateRequest = {
  business_id: string;
  photo: Omit<BusinessPhotoDto, "id">;
};

export type LocationUpdateRequest = {
  business_id: string;
  location: LocationDto;
};

export type BusinessResponse = {
  businessId: string;
  businessName: string;
  businessNumber: string;
  createdAt: string;
};

const handleApiError = (error: any): never => {
  console.error("API Error:", error);
  let message = "שגיאה כללית";

  if (error.response) {
    message = error.response.data.message || "שגיאת שרת";
  } else if (error.request) {
    message = "לא התקבלה תשובה מהשרת";
  } else {
    message = "שגיאה בשליחת הבקשה";
  }

  throw new Error(message);
};

// API functions for each endpoint
export const updateBusinessDetails = async (data: BusinessUpdateRequest) => {
  try {
    const response = await serverApi.put<BusinessResponse>("/admin/businesses/update-business", data, {
      includeCookies: true,
    });

    return (await response.json()).data;
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to update business details");
  }
};

export async function addBusinessSupervisor(data: SupervisorUpdateRequest) {
  console.log("🚀 PUT /supervisor/business/{businessId}");
  console.log("Data to send:", data);

  const response = await serverApi.post<KosherSupervisorDto>(
    `/admin/supervisors/business/${data.business_id}/add`,
    data.supervisor,
    {
      includeCookies: true,
    }
  );
  return (await response.json()).data;
}

export async function updateBusinessSupervisor(data: SupervisorUpdateRequest) {
  console.log("🚀 PUT /supervisor/business/{businessId}");
  const response = await serverApi.put<KosherSupervisorDto>(
    `/admin/supervisors/business/${data.business_id}`,
    data.supervisor,
    {
      includeCookies: true,
    }
  );
  return (await response.json()).data;
}

export async function deleteBusinessSupervisor(data: { business_id: string; supervisor_id: string }) {
  try {
    await serverApi.delete<void>(`/admin/supervisors/${data.business_id}/${data.supervisor_id}`, {
      includeCookies: true,
    });
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to delete business supervisor");
  }
}

export const updateBusinessPhotos = async (data: PhotoUpdateRequest) => {
  try {
    const response = await serverApi.post<BusinessPhotoDto>(`/admin/photos/business/${data.business_id}`, data.photo, {
      includeCookies: true,
    });
    return (await response.json()).data;
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to add business photos");
  }
};

export async function createBusinessPhoto(data: PhotoUpdateRequest) {
  try {
    const response = await serverApi.post<BusinessPhotoDto>(`/admin/photos/business/${data.business_id}`, data.photo, {
      includeCookies: true,
    });
    const parsedResponse = await response.json();
    if (!parsedResponse.data) throw new Error("Error creating business photo");
    console.log("Created business photo:", parsedResponse.data);
    return parsedResponse.data;
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to create business photo");
  }
}

export async function deleteBusinessPhoto(photoId: string) {
  const response = await serverApi.delete<void>(`/admin/photos/${photoId}`, {
    includeCookies: true,
  });
  if (response.status !== 204) throw new Error("Error deleting business photo");
}

export const updateBusinessLocation = async (data: LocationUpdateRequest) => {
  try {
    const response = await serverApi.put<LocationDto>(`/admin/location/${data.business_id}/location`, data.location, {
      includeCookies: true,
    });

    return (await response.json()).data;
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to update business location");
  }
};

export async function addBusinessCertificate(data: CertificateUpdateRequest) {
  try {
    const response = await serverApi.post<KosherCertificateDto>(
      `/admin/certificates/business/${data.business_id}`,
      data.certificate,
      {
        includeCookies: true,
      }
    );
    return (await response.json()).data;
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to add business certificate");
  }
}

export async function deleteBusinessCertificate(data: { business_id: string; certificate_id: string }) {
  try {
    await serverApi.delete<void>(`/admin/certificates/business/${data.business_id}/${data.certificate_id}`, {
      includeCookies: true,
    });
  } catch (error) {
    handleApiError(error);
    throw new Error("Failed to delete business certificate");
  }
}
