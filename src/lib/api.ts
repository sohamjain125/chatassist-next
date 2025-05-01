import axios from 'axios';

const API_BASE_URL =  'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const geocodeAddress = async (address: string) => {
  try {
    const response = await api.get('/geocode', {
      params: { address },
    });
    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

export const searchPlaces = async (query: string, location: string, radius: number = 5000) => {
  try {
    const response = await api.get('/places', {
      params: { query, location, radius },
    });
    return response.data;
  } catch (error) {
    console.error('Places search error:', error);
    throw error;
  }
}; 