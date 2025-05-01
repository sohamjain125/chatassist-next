import { useState, useEffect } from 'react';
import { geocodeAddress, searchPlaces } from '@/lib/api';

interface Location {
  lat: number;
  lng: number;
}

interface Place {
  name: string;
  vicinity: string;
  geometry: {
    location: Location;
  };
}

export const useMap = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddress = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await geocodeAddress(address);
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        setCurrentLocation(location);
        return location;
      }
      throw new Error('No results found');
    } catch (err) {
      setError('Failed to find location');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findNearbyPlaces = async (query: string, location: Location) => {
    try {
      setLoading(true);
      setError(null);
      const locationString = `${location.lat},${location.lng}`;
      const result = await searchPlaces(query, locationString);
      setPlaces(result.results || []);
    } catch (err) {
      setError('Failed to find nearby places');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentLocation,
    places,
    loading,
    error,
    searchAddress,
    findNearbyPlaces,
  };
}; 