/// <reference types="@types/google.maps" />

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Loader } from '@googlemaps/js-api-loader';

type GoogleWindow = Window & typeof globalThis & {
  google: any;
  initMap: () => void;
  googleMapsLoaded: boolean;
};

interface Location {
  lat: number;
  lng: number;
}

interface BuildingMeasurement {
  start: Location;
  end: Location;
  length: string;
}

interface BuildingOutline {
  coordinates: Location[];
  measurements: BuildingMeasurement[];
  area: string;
}

interface MapProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onAddressSelect?: (address: string) => void;
  showSearch?: boolean;
  showControls?: boolean;
  className?: string;
  height?: string;
  initialAddress?: string;
  readOnly?: boolean;
  buildingOutline?: {
    coordinates: Array<{lat: number; lng: number}>;
    measurements: Array<{
      start: {lat: number; lng: number};
      end: {lat: number; lng: number};
      length: string;
    }>;
    area: string;
  };
}

export default function Map({
  center = { lat: -38.3396, lng: 144.3177 }, // Default to Torquay
  zoom = 13,
  onLocationSelect,
  onAddressSelect,
  showSearch = false,
  showControls = false,
  className = '',
  height = '200px',
  initialAddress = '',
  readOnly = false,
  buildingOutline
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        geocoder.current = new google.maps.Geocoder();
        autocompleteService.current = new google.maps.places.AutocompleteService();
        
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: showControls,
            scrollwheel: !readOnly,
            draggable: !readOnly,
            clickableIcons: !readOnly
          });

          setMap(mapInstance);

          // Initialize places service
          placesService.current = new google.maps.places.PlacesService(mapInstance);

          // Add marker if center is provided
          if (center) {
            const markerInstance = new google.maps.Marker({
              position: center,
              map: mapInstance,
              draggable: !readOnly
            });

            markerInstance.addListener('dragend', () => {
              const position = markerInstance.getPosition();
              if (position && onLocationSelect) {
                onLocationSelect({
                  lat: position.lat(),
                  lng: position.lng()
                });
              }
            });

            setMarker(markerInstance);
          }

          // Initialize search box if search is enabled
          if (showSearch && inputRef.current) {
            const searchBoxInstance = new google.maps.places.SearchBox(
              inputRef.current
            );

            searchBoxInstance.addListener('places_changed', () => {
              const places = searchBoxInstance.getPlaces();
              if (places && places.length > 0) {
                const place = places[0];
                if (place.geometry && place.geometry.location) {
                  const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                  };

                  mapInstance.setCenter(location);
                  mapInstance.setZoom(15);

                  if (marker) {
                    marker.setPosition(location);
                  } else {
                    const newMarker = new google.maps.Marker({
                      position: location,
                      map: mapInstance,
                      draggable: !readOnly
                    });
                    setMarker(newMarker);
                  }

                  if (onLocationSelect) {
                    onLocationSelect(location);
                  }

                  if (onAddressSelect && place.formatted_address) {
                    onAddressSelect(place.formatted_address);
                    setSearchQuery(place.formatted_address);
                  }
                }
              }
            });

            setSearchBox(searchBoxInstance);
          }

          // Add building outline if provided
          if (buildingOutline) {
            const polygon = new google.maps.Polygon({
              paths: buildingOutline.coordinates,
              strokeColor: "#4285F4",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#4285F4",
              fillOpacity: 0.15,
              map: mapInstance
            });

            // Add measurements
            buildingOutline.measurements.forEach(measurement => {
              const line = new google.maps.Polyline({
                path: [measurement.start, measurement.end],
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                map: mapInstance
              });

              // Add length label
              const midPoint = {
                lat: (measurement.start.lat + measurement.end.lat) / 2,
                lng: (measurement.start.lng + measurement.end.lng) / 2
              };

              const lengthInfoWindow = new google.maps.InfoWindow({
                content: measurement.length,
                position: midPoint
              });
              lengthInfoWindow.open(mapInstance);
            });

            // Add area label
            const bounds = new google.maps.LatLngBounds();
            buildingOutline.coordinates.forEach(coord => {
              bounds.extend(coord);
            });

            const center = bounds.getCenter();
            const areaInfoWindow = new google.maps.InfoWindow({
              content: `Area: ${buildingOutline.area}`,
              position: center
            });
            areaInfoWindow.open(mapInstance);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (marker) {
        marker.setMap(null);
      }
      if (searchBox) {
        // Remove search box listeners
        google.maps.event.clearInstanceListeners(searchBox);
      }
    };
  }, [center, zoom, showControls, readOnly, showSearch, buildingOutline, onLocationSelect, onAddressSelect]);

  // Handle search input changes
  useEffect(() => {
    if (!autocompleteService.current || !searchQuery) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await autocompleteService.current?.getPlacePredictions({
          input: searchQuery,
          componentRestrictions: { country: 'au' },
          types: ['address']
        });

        if (response && response.predictions) {
          setSuggestions(response.predictions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {showSearch && (
          <div className="relative mb-4">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for a location"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="pr-24"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSearchQuery(suggestion.description);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg"
        />
      </CardContent>
    </Card>
  );
} 