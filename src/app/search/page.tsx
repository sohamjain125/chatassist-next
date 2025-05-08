'use client';

import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, AlertCircle, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Map from '@/components/Map';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PropertyDetails, PropertySuggestion } from '@/interface/property.interface';


export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PropertySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      try {
        const response = await fetch(`/api/property-list?query=${encodeURIComponent(value)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter an address to search');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First get property suggestions
      const suggestionsResponse = await fetch(`/api/property-list?query=${encodeURIComponent(searchQuery)}`);
      if (!suggestionsResponse.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const suggestions = await suggestionsResponse.json();
      
      if (suggestions.length === 0) {
        setError('No properties found for this address');
        return;
      }

      // Get details for the first suggestion
      const propertyResponse = await fetch(`/api/property-details?assessmentNumber=${suggestions[0].Assessment_Number}`);
      if (!propertyResponse.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyDetails = await propertyResponse.json();
      setSelectedProperty(propertyDetails);
      setSearchQuery(suggestions[0].Address);
    } catch (error) {
      console.error('Error searching property:', error);
      setError('Failed to search property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: PropertySuggestion) => {
    setSearchQuery(suggestion.Address);
    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/property-details?assessmentNumber=${suggestion.Assessment_Number}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyDetails = await response.json();
      setSelectedProperty(propertyDetails);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedProperty) return;
    setIsContinueLoading(true);

    const propertyData = {
      address: selectedProperty.Address,
      assessmentNumber: selectedProperty.Assessment_Number,
      latitude: selectedProperty.Latitude,
      longitude: selectedProperty.Longitude,
      streetNumber: selectedProperty.StreetNumber,
      streetName: selectedProperty.StreetName,
      suburb: selectedProperty.Suburb,
      state: selectedProperty.State,
      postcode: selectedProperty.Postcode,
      allotmentArea: selectedProperty.AllotmentArea,
      lotNo: selectedProperty.LotNo,
      planNo: selectedProperty.PlanNo,
      Property_ID: selectedProperty.Property_ID,
      timestamp: new Date().toISOString()
    };

    const queryParams = new URLSearchParams({
      data: JSON.stringify(propertyData)
    });
    
    router.push(`/property?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {(isLoading || isContinueLoading) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Searching properties..." : "Loading property details..."}
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Find answers for your property</h1>
          <p className="text-gray-600 mb-4">
            Adress Hub's technology is taking the property industry forward with instant analysis for critical planning questions. Try it for free by entering an address below.
          </p>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search a property or click one on the map"
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pr-24 h-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchQuery && (
                  <button
                    onClick={() => { 
                      setSearchQuery(''); 
                      setSuggestions([]); 
                      setShowSuggestions(false);
                      setSelectedProperty(null);
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
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                </Button>
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
                        {suggestion.Address}
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

          {selectedProperty && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-[400px] mb-8">
                  <Map
                    center={{ lat: selectedProperty.Latitude, lng: selectedProperty.Longitude }}
                    propertyPfi={selectedProperty.Property_ID}
                    zoom={15}
                    showSearch={false}
                   
                    height="400px"
                    tilt={30}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Assessment Number</div>
                      <div className="font-medium">{selectedProperty.Assessment_Number}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Lot Number</div>
                      <div className="font-medium">{selectedProperty.LotNo}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium">{selectedProperty.Address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plan Number</div>
                      <div className="font-medium">{selectedProperty.PlanNo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Area</div>
                      <div className="font-medium">{selectedProperty.AllotmentArea} m²</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button 
                      className="w-full" 
                      onClick={handleContinue}
                      disabled={isContinueLoading}
                    >
                      {isContinueLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Continue with Address"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
