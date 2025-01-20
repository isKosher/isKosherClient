export interface BusinessPhoto {
    url: string | null;
    photo_info: string | null;
  }
  
  export interface Restaurant {
    business_id: string;
    business_name: string;
    food_types: (string | null)[];
    food_item_types: (string | null)[];
    address: string;
    street_number: number;
    city: string;
    business_photos: BusinessPhoto[];
    kosher_type: string;
    business_type: string;
    business_details: string;
    location_details: string;
    business_rating: number;
    supervisor_name: string;
    supervisor_contact: string;
    supervisor_authority: string;
    business_certificate: string;
    expiration_date: string;
  }