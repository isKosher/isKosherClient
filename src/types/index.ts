export type BusinessPhoto = {
  id: string | null;
  url: string | null;
  photo_info: string | null;
};

export type KosherType = {
  id: string | null;
  name: string | null;
  kosher_icon_url: string | null;
};

export type KosherSupervisor = {
  id: string;
  name: string;
  authority: string;
  contact_info: string;
};

export type KosherCertificate = {
  id: string | null;
  certificate: string | null;
  expiration_date: string | null;
};

export type Restaurant = {
  business_id: string;
  business_name: string;
  food_types: string[];
  food_item_types: string[];
  location: {
    address: string;
    street_number: number;
    city: string;
    location_details: string;
    latitude: number;
    longitude: number;
  };
  business_photos: BusinessPhoto[];
  kosher_types: KosherType[];
  business_type: string;
  business_details: string;
  business_rating: number;
  kosher_supervisors: KosherSupervisor[];
  kosher_certificates: KosherCertificate[];
};

export type BusinessSearchResult = {
  business_id: string;
  business_name: string;
  city: string;
  address: string;
  match_score: number;
};

export type RestaurantPreview = {
  business_id: string;
  business_name: string;
  food_types: string[];
  food_item_types: string[];
  location: {
    address: string;
    street_number: number;
    city: string;
  };
  business_photos: BusinessPhoto[];
  kosher_type: string;
  business_type: string;
};

export interface LoginResponse {
  success: boolean;
  error?: string;
}

export interface ServerPayload {
  business_name: string;
  business_phone: string;
  business_details: string;
  business_rating: number;
  location: {
    street_number: number;
    address: string;
    region: string;
    location_details?: string;
    city: string;
    longitude?: number;
    latitude?: number;
  };
  kosher_types: string[];
  business_type_name: string;
  food_types: string[];
  food_item_types: string[];
  supervisor: {
    name: string;
    contact_info: string;
    authority: string;
  };
  kosher_certificate: {
    certificate: string;
    expiration_date: string;
  };
}
