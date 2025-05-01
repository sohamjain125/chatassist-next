const API_BASE_URL = 'http://localhost:5000/api';

export interface PropertyGeometry {
  rings: number[][][];
  spatialReference: {
    wkid: number;
  };
}

export interface PropertyDetails {
  address: string;
  area: number;
  zoning: Array<{
    code: string;
    name: string;
    lga: string;
    gazDate: string;
  }>;
  overlays: Array<{
    code: string;
    name: string;
    lga: string;
    gazDate: string;
  }>;
}

export const propertyApi = {
  async getPropertyDetails(address: string, geometry: PropertyGeometry): Promise<PropertyDetails> {
    const response = await fetch(`${API_BASE_URL}/property/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, geometry }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property details');
    }

    const data = await response.json();
    return data.propertyDetails;
  },

  async searchProperty(address: string) {
    const response = await fetch(`${API_BASE_URL}/property/search?address=${encodeURIComponent(address)}`);

    if (!response.ok) {
      throw new Error('Failed to search property');
    }

    return response.json();
  }
}; 