
import axios from 'axios';

export async function geocode(address: string) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}
