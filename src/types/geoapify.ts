export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoapifyFeature {
  type: "Feature";
  properties: {
    name?: string;
    country?: string;
    country_code?: string;
    state?: string;
    county?: string;
    city?: string;
    postcode?: string;
    suburb?: string;
    street?: string;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    result_type: string;
    lon: number;
    lat: number;
    rank?: {
      confidence: number;
      match_type: string;
    };
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface GeoapifyResponse {
  type: "FeatureCollection";
  features: GeoapifyFeature[];
}

export class GeoapifyError extends Error {
  constructor(message: string, public statusCode?: number, public originalError?: Error) {
    super(message);
    this.name = "GeoapifyError";
  }
}
