'use client';

import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, AlertCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Map from '@/components/Map';
import AddressDetails from '@/components/AddressDetails';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const SEARCH_STATE_KEY = 'property_search_state';

interface AddressResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  place_id: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  types: string[];
}

interface SearchResponse {
  results: AddressResult[];
  status: string;
}

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buildingData, setBuildingData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load saved search state on component mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SEARCH_STATE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setSearchQuery(parsedState.searchQuery || '');
        setSearchResult(parsedState.searchResult || null);
        setBuildingData(parsedState.buildingData || null);
      }
    } catch (error) {
      console.error('Error loading saved search state:', error);
    }
  }, []);

  // Save search state when it changes
  useEffect(() => {
    if (searchResult || buildingData) {
      const stateToSave = {
        searchQuery,
        searchResult,
        buildingData
      };
      localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(stateToSave));
    }
  }, [searchQuery, searchResult, buildingData]);

  // Initialize Google Maps AutocompleteService
  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      // Load Google Maps script if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      };
      document.head.appendChild(script);
    };

    initAutocomplete();

    // Handle clicks outside suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter an address to search');
      return;
    }

    console.log('Starting search for:', searchQuery);
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setBuildingData(null);
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to search address');
      }
      
      const data: SearchResponse = await response.json();
      console.log('Search response:', data);
      
      if (data.status === 'OK' && data.results.length > 0) {
        setSearchResult(data);
        // Calculate building outline based on the viewport
        const viewport = data.results[0].geometry.viewport;
        const buildingOutline = {
          coordinates: [
            { lat: viewport.southwest.lat, lng: viewport.southwest.lng },
            { lat: viewport.southwest.lat, lng: viewport.northeast.lng },
            { lat: viewport.northeast.lat, lng: viewport.northeast.lng },
            { lat: viewport.northeast.lat, lng: viewport.southwest.lng },
          ],
          measurements: [
            {
              start: { lat: viewport.northeast.lat, lng: viewport.southwest.lng },
              end: { lat: viewport.northeast.lat, lng: viewport.northeast.lng },
              length: "64.3m"
            },
            {
              start: { lat: viewport.northeast.lat, lng: viewport.northeast.lng },
              end: { lat: viewport.southwest.lat, lng: viewport.northeast.lng },
              length: "55.2m"
            },
            {
              start: { lat: viewport.southwest.lat, lng: viewport.northeast.lng },
              end: { lat: viewport.southwest.lat, lng: viewport.southwest.lng },
              length: "64.3m"
            },
            {
              start: { lat: viewport.southwest.lat, lng: viewport.southwest.lng },
              end: { lat: viewport.northeast.lat, lng: viewport.southwest.lng },
              length: "55.2m"
            }
          ],
          area: "700m²"
        };
        setBuildingData(buildingOutline);
        console.log('Building data set:', buildingOutline);
      } else if (data.status === 'ZERO_RESULTS') {
        setError('No results found for this address. Please try a different search.');
      } else {
        setError('Failed to get address details. Please try again.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to search address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (searchResult?.results[0]) {
      console.log('Starting handleContinue with search result:', searchResult.results[0]);
      const addressComponents = searchResult.results[0].address_components;
      const suburb = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || '';
      const postcode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || '';
      
      const propertyData = {
        address: searchResult.results[0].formatted_address,
        suburb,
        state,
        postcode,
        titleId: 'PS826416',
        lotArea: '3162 m²',
        lga: 'Melbourne',
        isMultiLot: 'No',
        propertyId: '109492',
        location: searchResult.results[0].geometry.location,
        buildingOutline: buildingData,
        timestamp: new Date().toISOString()
      };

      console.log('Property data to save:', propertyData);

      // Save property data to localStorage temporarily
      const PROPERTY_DATA_KEY = 'current_property_data';
      try {
        localStorage.setItem(PROPERTY_DATA_KEY, JSON.stringify(propertyData));
        console.log('Property data saved to localStorage');
      } catch (e) {
        console.error('Error saving property data:', e);
      }

      // Navigate to property page with address as URL parameter
      const addressParam = encodeURIComponent(propertyData.address);
      console.log('Navigating to property page with address:', addressParam);
      router.push(`/property?address=${addressParam}`);
    } else {
      console.log('No search result available for handleContinue');
    }
  };

  // Fetch address suggestions using Google Maps JS API
  const fetchSuggestions = (value: string) => {
    if (!autocompleteService.current || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      { input: value },
      (predictions: any[], status: string) => {
        if (status === 'OK' && predictions) {
          setSuggestions(predictions.map((p) => p.description));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
    // Create a synthetic event to trigger the search
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(syntheticEvent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Find planning answers for your property</h1>
          <p className="text-gray-600 mb-8">
            PropCode's technology is taking the property industry forward with instant analysis for critical planning questions. Try it for free by entering an address below.
          </p>

          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search a property or click one on the map"
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pr-24 h-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-50 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchResult && buildingData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="h-[400px]">
                  <Map
                    center={searchResult.results[0].geometry.location}
                    buildingOutline={buildingData}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500">Title</div>
                    <div className="font-medium">PS826416</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Local Government Area</div>
                    <div className="font-medium">Melbourne</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium">{searchResult.results[0].formatted_address}</div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleContinue}
                >
                  Continue with address
                </Button>
              </div>
            </div>
          )}

          {!searchResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="mb-4">
                  <SearchIcon className="h-12 w-12 mx-auto text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Rapid Planning Report</h3>
                <p className="text-gray-600 text-sm">
                  PropCode's AI-powered report is the first automated planning report that analyses the full text of planning documents to find the right answers.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <svg className="h-12 w-12 mx-auto text-primary" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    <path fill="currentColor" d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Analyse CDC Options</h3>
                <p className="text-gray-600 text-sm">
                  Our instant tool shows whether your project in NSW is eligible for fast CDC approval. With a transparent audit trail, it shows max height and floor area, min lot area, and other building rules.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <svg className="h-12 w-12 mx-auto text-primary" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16z"/>
                    <path fill="currentColor" d="M8 6h8v2H8zm0 4h8v2H8zm0 4h8v2H8z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">PropCode Library</h3>
                <p className="text-gray-600 text-sm">
                  Our free regulations viewer makes it easier to find, read, and search planning regulations that are relevant to a property in NSW and VIC. Read all necessary regulations in one beautiful tool.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
