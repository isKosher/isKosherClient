export type BusinessPhoto = {
  id: string | null;
  url: string | null;
  photo_info: string | null;
};

export type KosherType = {
  id: string | null;
  name: string;
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

export interface PageResponse<T> {
  content: T[];
  page_number: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
}

export interface BusinessDetailsResponse {
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
}

export type UserOwnedBusinessResponse = {
  business_id: string;
  business_name: string;
  business_details: string;
  business_rating: number | null;
  business_number: string;
  kosher_types: {
    id: string;
    name: string;
    kosher_icon_url: string | null;
  }[];
  business_type: string;
  location: LocationDto;
  supervisors: KosherSupervisor[];
  certificates: {
    id: string;
    certificate: string;
    expiration_date: string;
  }[];
  food_types: string[];
  food_item_types: string[];
  business_photos: {
    id: string;
    url: string;
    photo_info: string | null;
  }[];
};

// Server request types
export type LocationDto = {
  street_number: number;
  address: string;
  city: string;
  region?: string;
  longitude?: number;
  latitude?: number;
  location_details: string;
};

export type KosherCertificateDto = {
  id?: string;
  certificate: string;
  expiration_date: string;
};

export type KosherSupervisorDto = {
  id?: string;
  name: string;
  contact_info: string;
  authority: string;
};

export type BusinessPhotoDto = {
  id?: string;
  url: string;
  photo_info?: string;
};

export type BusinessCreateRequest = {
  businessName: string;
  businessPhone: string;
  businessDetails: string;
  businessRating?: number;
  location: LocationDto;
  kosherTypes: string[];
  businessTypeName: string;
  foodTypes: string[];
  foodItemTypes: string[];
  businessPhotos?: BusinessPhotoDto[];
  supervisor: KosherSupervisorDto;
  kosherCertificate: KosherCertificateDto;
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

export interface BusinessPreview {
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
  kosher_types: KosherType[];
  business_type: string;
  travel_info?: {
    driving_duration: string;
    driving_distance: string;
    walking_duration: string;
    walking_distance: string;
  };
  dest_loc?: {
    latitude: number;
    longitude: number;
  };
}

export interface LoginResponse {
  success: boolean;
  error?: string;
}

export interface Option {
  id: string;
  name: string;
  isCustom?: boolean;
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

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export interface GovmapResult {
  ResultLable: string;
  X: number;
  Y: number;
  ObjectID: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}
